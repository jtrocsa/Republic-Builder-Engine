# Shared Blender side of the render-to-pixel-art pipeline (decision log 0152).
#
# A job builds each object out of Parts, then calls render_object(). Every object is rendered
# twice at SUPERSAMPLE times its final size:
#
#   <name>.color.png  flat colour, lit by a fixed rule on the face normal (see _shade_factor)
#   <name>.id.png     one flat colour per part, no anti-aliasing: where it changes, a seam goes
#
# scripts/assets/pixelize-renders.js then reduces each pair to pixel art: majority-downsample,
# darken the seams and the silhouette edge, trim, and compose the commission strip.
#
# Every number below that describes the look was measured off the library's own office packs,
# not chosen — the measurements are in decision log 0152 and repeated at each constant.

import json
import math
import os
import sys

import bmesh
import bpy
from mathutils import Vector

SUPERSAMPLE = 4  # rendered at 4x, reduced by majority vote per 4x4 block
MARGIN_PX = 2  # empty pixels kept round the ink at final size; trimmed again when composed

# The packs draw a front at about 0.72 of the pixels per metre they give a width (fridge 0.70,
# counter cabinet 0.79, desk 0.63, copier 0.63): furniture is squat and wide, and a render at true
# proportions reads tall and thin beside it.
FRONT_RATIO = 0.72

# Tops are painted at full value and fronts at about 0.68 of it (fridge 0.85, counter cabinet
# 0.70, tall cabinet 0.68, desk 0.65, by luminance). The light is overhead: the packs show no side
# faces, so the only horizontal cue is a slight preference for the left.
TOP_VALUE = 1.0
FRONT_VALUE = 0.70
LEFT_BIAS = 0.10


def out_dir():
    return sys.argv[sys.argv.index("--") + 1]


def srgb_to_linear(c):
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def hex_rgb(value):
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) / 255 for i in (0, 2, 4))


def reset_scene():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    _materials.clear()
    scene = bpy.context.scene
    scene.view_settings.view_transform = "Standard"
    scene.view_settings.look = "None"
    scene.view_settings.exposure = 0.0
    scene.view_settings.gamma = 1.0
    scene.render.film_transparent = True
    # Blender dithers 8-bit output by default. That noise would put a different colour on every
    # pixel of a flat face and defeat both the majority vote and the seam pass.
    scene.render.dither_intensity = 0.0
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGBA"
    scene.render.image_settings.color_depth = "8"
    scene.render.resolution_percentage = 100
    return scene


# --- materials -------------------------------------------------------------------------------

_materials = {}


def _shade_factor(nodes, links):
    """Emission strength as a function of the world normal: TOP_VALUE facing up, FRONT_VALUE
    facing the camera, a touch lighter facing left. Computed in display space and raised to 2.2
    so the ratios measured on the packs' sRGB pixels survive the view transform."""
    geo = nodes.new("ShaderNodeNewGeometry")
    sep = nodes.new("ShaderNodeSeparateXYZ")
    links.new(geo.outputs["Normal"], sep.inputs[0])

    def math_node(op, a, b):
        node = nodes.new("ShaderNodeMath")
        node.operation = op
        for socket, value in ((node.inputs[0], a), (node.inputs[1], b)):
            if isinstance(value, (int, float)):
                socket.default_value = value
            else:
                links.new(value, socket)
        return node.outputs[0]

    up = math_node("MAXIMUM", sep.outputs["Z"], 0.0)
    lit = math_node("MULTIPLY_ADD", up, TOP_VALUE - FRONT_VALUE)
    lit.node.inputs[2].default_value = FRONT_VALUE
    left = math_node("MULTIPLY", sep.outputs["X"], -LEFT_BIAS)
    value = math_node("ADD", lit, left)
    return math_node("POWER", value, 2.2)


def material(hex_color):
    """A flat, self-lit material: the colour is the pack colour a face gets when lit from above."""
    if hex_color in _materials:
        return _materials[hex_color]
    mat = bpy.data.materials.new(f"flat {hex_color}")
    if hasattr(mat, "use_nodes"):
        mat.use_nodes = True
    nodes, links = mat.node_tree.nodes, mat.node_tree.links
    nodes.clear()
    out = nodes.new("ShaderNodeOutputMaterial")
    emit = nodes.new("ShaderNodeEmission")
    scale = nodes.new("ShaderNodeVectorMath")
    scale.operation = "SCALE"
    scale.inputs[0].default_value = [srgb_to_linear(c) for c in hex_rgb(hex_color)]
    links.new(_shade_factor(nodes, links), scale.inputs["Scale"])
    links.new(scale.outputs["Vector"], emit.inputs["Color"])
    emit.inputs["Strength"].default_value = 1.0
    links.new(emit.outputs[0], out.inputs["Surface"])
    mat.diffuse_color = (*[srgb_to_linear(c) for c in hex_rgb(hex_color)], 1.0)
    _materials[hex_color] = mat
    return mat


# --- geometry --------------------------------------------------------------------------------
#
# Axes: +X right, +Y away from the camera, +Z up. A front face is the one at the smallest Y.
# Sizes are metres at real-world scale; the camera decides pixels.


def _rotate_x(point, pivot, degrees):
    """Rotates a point about the X axis through `pivot` (y, z). Positive tips the top away."""
    if not degrees:
        return point
    a = math.radians(degrees)
    x, y, z = point
    py, pz = pivot
    dy, dz = y - py, z - pz
    return (x, py + dy * math.cos(a) + dz * math.sin(a), pz - dy * math.sin(a) + dz * math.cos(a))


class Part:
    """One piece of an object: any number of boxes and discs in one colour, drawn as one region.

    Two Parts meet at a seam; two shapes inside one Part do not. `group` lets separate Parts share
    a seam region (a label that should not get its own outline), so it is the seam pass rather than
    the geometry that decides where a dark line goes."""

    def __init__(self, obj_name, name, color, group=None):
        self.name = f"{obj_name}.{name}"
        self.color = color
        self.group = group
        self.bm = bmesh.new()

    def box(self, lo, hi, rot=0.0, pivot=None):
        x0, y0, z0 = lo
        x1, y1, z1 = hi
        pivot = pivot or (y0, z0)
        corners = [
            (x0, y0, z0), (x1, y0, z0), (x1, y1, z0), (x0, y1, z0),
            (x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1),
        ]  # fmt: skip
        verts = [self.bm.verts.new(_rotate_x(c, pivot, rot)) for c in corners]
        for face in ((0, 3, 2, 1), (4, 5, 6, 7), (0, 1, 5, 4), (2, 3, 7, 6), (3, 0, 4, 7), (1, 2, 6, 5)):
            self.bm.faces.new([verts[i] for i in face])
        return self

    def disc(self, centre, radius, y0, y1, segments=16):
        """A cylinder whose axis runs front to back — a reel seen face-on."""
        cx, cz = centre
        front, back = [], []
        for i in range(segments):
            t = 2 * math.pi * i / segments
            x, z = cx + radius * math.cos(t), cz + radius * math.sin(t)
            front.append(self.bm.verts.new((x, y0, z)))
            back.append(self.bm.verts.new((x, y1, z)))
        self.bm.faces.new(front)
        self.bm.faces.new(list(reversed(back)))
        for i in range(segments):
            j = (i + 1) % segments
            self.bm.faces.new((front[i], back[i], back[j], front[j]))
        return self

    def build(self, parent):
        bmesh.ops.recalc_face_normals(self.bm, faces=self.bm.faces)
        mesh = bpy.data.meshes.new(self.name)
        self.bm.to_mesh(mesh)
        self.bm.free()
        obj = bpy.data.objects.new(self.name, mesh)
        bpy.context.scene.collection.objects.link(obj)
        obj.data.materials.append(material(self.color))
        obj.parent = parent
        return obj


def _id_color(index):
    # Well-separated, deterministic, never transparent-black. Only equality is ever tested.
    return ((index * 67) % 251 / 255, (index * 137) % 241 / 255, (40 + index * 29) % 233 / 255, 1.0)


# --- camera and render -----------------------------------------------------------------------


def render_object(name, parts, *, top_ratio, px_per_m=None, fit_width_px=None):
    """Builds `parts`, frames them the way the office packs frame furniture, and renders both passes.

    top_ratio      pixels a metre of depth gets on a top face, over what a metre of height gets on a
                   front. Low things show a deep top and tall things a shallow one: the packs'
                   counter cabinet and desk measure 0.9-1.3, their fridge and tall cabinets 0.4-0.6.
    px_per_m       furniture scale (the packs' desks and cabinets: 53-64 px per metre of width), or
    fit_width_px   for a 1x1 prop — the packs draw every small prop to fill its tile, whatever the
                   object is, so its size is a width in pixels rather than a scale.
    """
    scene = bpy.context.scene
    # Every object is built at the origin, so the ones already rendered must stay out of this frame.
    for earlier in scene.objects:
        earlier.hide_render = True
    stage = bpy.data.objects.new(f"{name} (stage)", None)
    scene.collection.objects.link(stage)
    objects = [part.build(stage) for part in parts]

    # The packs' view is oblique: fronts square-on, tops stacked straight above them. A camera
    # pitched down by atan(top_ratio) gives exactly that, once depth and height are both stretched
    # by FRONT_RATIO * sqrt(1 + top_ratio^2) against width — an ortho camera shows a front at
    # cos(pitch) and a top at sin(pitch), and that stretch turns both into what was measured.
    pitch = math.atan(top_ratio)
    stretch = FRONT_RATIO * math.sqrt(1 + top_ratio**2)
    stage.scale = (1.0, stretch, stretch)

    cam_data = bpy.data.cameras.new(f"{name} camera")
    cam_data.type = "ORTHO"
    cam_data.sensor_fit = "HORIZONTAL"
    cam_data.clip_start = 0.01
    cam_data.clip_end = 100.0
    camera = bpy.data.objects.new(f"{name} camera", cam_data)
    scene.collection.objects.link(camera)
    scene.camera = camera
    camera.rotation_euler = (math.pi / 2 - pitch, 0.0, 0.0)
    bpy.context.view_layer.update()

    basis = camera.rotation_euler.to_matrix()
    right, up, forward = basis @ Vector((1, 0, 0)), basis @ Vector((0, 1, 0)), basis @ Vector((0, 0, -1))
    points = [obj.matrix_world @ v.co for obj in objects for v in obj.data.vertices]
    us, vs, ds = [p.dot(right) for p in points], [p.dot(up) for p in points], [p.dot(forward) for p in points]
    width_m, height_m = max(us) - min(us), max(vs) - min(vs)

    if fit_width_px:
        px_per_m = fit_width_px / width_m
    width_px = math.ceil(width_m * px_per_m - 1e-6) + 2 * MARGIN_PX
    height_px = math.ceil(height_m * px_per_m - 1e-6) + 2 * MARGIN_PX

    # Left and bottom edges land exactly on pixel boundaries, so the ground line is one clean row.
    centre_u = min(us) - MARGIN_PX / px_per_m + width_px / (2 * px_per_m)
    centre_v = min(vs) - MARGIN_PX / px_per_m + height_px / (2 * px_per_m)
    camera.location = right * centre_u + up * centre_v + forward * (min(ds) - 10.0)
    cam_data.ortho_scale = width_px / px_per_m

    scene.render.resolution_x = width_px * SUPERSAMPLE
    scene.render.resolution_y = height_px * SUPERSAMPLE

    folder = out_dir()
    # Colour pass: EEVEE, one sample, so nothing is blended across an edge.
    scene.render.engine = "BLENDER_EEVEE"
    scene.eevee.taa_render_samples = 1
    scene.render.filter_size = 0.0
    scene.render.filepath = os.path.join(folder, f"{name}.color.png")
    bpy.ops.render.render(write_still=True)

    # Seam pass: Workbench, flat object colour, anti-aliasing off. One colour per seam region.
    groups = {}
    for part, obj in zip(parts, objects):
        key = part.group or part.name
        if key not in groups:
            groups[key] = _id_color(len(groups) + 1)
        obj.color = groups[key]
    scene.render.engine = "BLENDER_WORKBENCH"
    shading = scene.display.shading
    shading.light = "FLAT"
    shading.color_type = "OBJECT"
    shading.show_object_outline = False
    shading.show_cavity = False
    shading.show_shadows = False
    shading.show_specular_highlight = False
    scene.display.render_aa = "OFF"
    scene.render.filepath = os.path.join(folder, f"{name}.id.png")
    bpy.ops.render.render(write_still=True)

    # Leave the saved .blend at true proportions for anybody who opens it.
    stage.scale = (1.0, 1.0, 1.0)

    return {
        "name": name,
        "color": f"{name}.color.png",
        "id": f"{name}.id.png",
        "supersample": SUPERSAMPLE,
        "widthPx": width_px,
        "heightPx": height_px,
        "pxPerM": round(px_per_m, 2),
        "frontPxPerM": round(px_per_m * FRONT_RATIO, 2),
        "topPxPerM": round(px_per_m * FRONT_RATIO * top_ratio, 2),
        "pitchDeg": round(math.degrees(pitch), 1),
        "stage": stage.name,
        "camera": camera.name,
    }


def finish(job, rendered):
    """Lays the objects out side by side for browsing, saves the .blend, writes job.json."""
    x = 0.0
    for entry in rendered:
        stage = bpy.data.objects[entry["stage"]]
        children = [c for c in stage.children]
        xs = [(c.matrix_world @ v.co).x for c in children for v in c.data.vertices]
        stage.location.x = x - min(xs)
        x += (max(xs) - min(xs)) + 0.5
        for child in children:
            child.hide_render = False
        cam = bpy.data.objects[entry["camera"]]
        cam.hide_render = True
        cam.hide_viewport = True
    folder = out_dir()
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(folder, f"{job}.blend"))
    manifest = {"job": job, "blender": bpy.app.version_string, "objects": rendered}
    with open(os.path.join(folder, "job.json"), "w", encoding="utf-8") as handle:
        json.dump(manifest, handle, indent=2)
    print(f"wrote {len(rendered)} objects to {folder}")
