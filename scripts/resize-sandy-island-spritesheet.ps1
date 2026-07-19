# One-off dev utility: slices the 9 frames out of
# apps/web/src/assets/tilesets/spritesheet.png (per spritesheet.json, a codeshack.io
# "Images to Sprite Sheet Generator" atlas of ChatGPT-generated art) and resizes each
# down to this repo's established 48px tile convention, writing the results to
# apps/web/src/assets/tilesets/Sandy Island/. Not part of npm run build — run manually
# with: powershell -File scripts/resize-sandy-island-spritesheet.ps1
#
# Ground textures (Sand, dirt-path, grass, water, stone, wood, tall-grass) are already
# full-bleed square textures, so they're downscaled directly to 48x48. The two object
# sprites (palm-tree, fire) are first trimmed to their actual non-transparent content
# (the source frames have lots of empty margin, "trimmed": false in the JSON) so the
# subject fills its final cell(s) instead of shrinking further inside unnecessary
# padding, then scaled preserving aspect ratio and composited onto a clean transparent
# 48-wide canvas — 48x96 (2 stacked cells) for the palm tree, matching the footprint
# scripts/generate-caribbean-tmj.js's PALM_A/B/C stamps already use; 48x48 (1 cell) for
# the fire, matching that same script's single-cell CAMPFIRE prop.
#
# All resizing uses HighQualityBicubic + AntiAlias, done as a multi-step halving descent
# rather than one large jump, to avoid moire/aliasing on the sand-grain/water-ripple
# detail in the source art — the concrete technique for "resize without losing clarity."

Add-Type -AssemblyName System.Drawing

$repoRoot = Split-Path -Parent $PSScriptRoot
$atlasPath = Join-Path $repoRoot "apps\web\src\assets\tilesets\spritesheet.png"
$jsonPath = Join-Path $repoRoot "apps\web\src\assets\tilesets\spritesheet.json"
$outDir = Join-Path $repoRoot "apps\web\src\assets\tilesets\Sandy Island"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

$atlas = [System.Drawing.Bitmap]::FromFile($atlasPath)
$manifest = Get-Content $jsonPath -Raw | ConvertFrom-Json

function New-TransparentBitmap([int]$w, [int]$h) {
  $bmp = New-Object System.Drawing.Bitmap -ArgumentList $w, $h, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::Transparent)
  $g.Dispose()
  return $bmp
}

function Crop([System.Drawing.Bitmap]$src, [int]$x, [int]$y, [int]$w, [int]$h) {
  $out = New-TransparentBitmap $w $h
  $g = [System.Drawing.Graphics]::FromImage($out)
  $g.CompositingMode = [System.Drawing.Drawing2D.CompositingMode]::SourceCopy
  $srcRect = New-Object System.Drawing.Rectangle -ArgumentList $x, $y, $w, $h
  $destRect = New-Object System.Drawing.Rectangle -ArgumentList 0, 0, $w, $h
  $g.DrawImage($src, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  return $out
}

# High-quality downscale via repeated halving, finishing with one precise resize to the
# exact target dimensions.
function Resize-HighQuality([System.Drawing.Bitmap]$src, [int]$targetW, [int]$targetH) {
  $current = $src
  while ($true) {
    $nextW = [Math]::Max($targetW, [int]($current.Width / 2))
    $nextH = [Math]::Max($targetH, [int]($current.Height / 2))
    if ($nextW -ge $current.Width -or $nextH -ge $current.Height) { break }
    $step = New-TransparentBitmap $nextW $nextH
    $g = [System.Drawing.Graphics]::FromImage($step)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.DrawImage($current, 0, 0, $nextW, $nextH)
    $g.Dispose()
    if ($current -ne $src) { $current.Dispose() }
    $current = $step
  }
  if ($current.Width -eq $targetW -and $current.Height -eq $targetH) { return $current }
  $final = New-TransparentBitmap $targetW $targetH
  $g = [System.Drawing.Graphics]::FromImage($final)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.DrawImage($current, 0, 0, $targetW, $targetH)
  $g.Dispose()
  if ($current -ne $src) { $current.Dispose() }
  return $final
}

# Finds the alpha bounding box of an object sprite by scanning a small nearest-neighbor
# downscale (fast — GetPixel on the full 1024x1024 source would be far too slow), then
# scales the box back up to source-resolution coordinates with a small safety margin.
function Get-AlphaBoundingBox([System.Drawing.Bitmap]$src) {
  $probeSize = 128
  $probe = New-Object System.Drawing.Bitmap -ArgumentList $probeSize, $probeSize, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $g = [System.Drawing.Graphics]::FromImage($probe)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::NearestNeighbor
  $g.DrawImage($src, 0, 0, $probeSize, $probeSize)
  $g.Dispose()

  $minX = $probeSize; $minY = $probeSize; $maxX = -1; $maxY = -1
  for ($y = 0; $y -lt $probeSize; $y++) {
    for ($x = 0; $x -lt $probeSize; $x++) {
      if ($probe.GetPixel($x, $y).A -gt 10) {
        if ($x -lt $minX) { $minX = $x }
        if ($y -lt $minY) { $minY = $y }
        if ($x -gt $maxX) { $maxX = $x }
        if ($y -gt $maxY) { $maxY = $y }
      }
    }
  }
  $probe.Dispose()
  if ($maxX -lt 0) { return @{ X = 0; Y = 0; W = $src.Width; H = $src.Height } }

  $scale = $src.Width / $probeSize
  $pad = 2 # probe-space pixels, generous at 8px source-space margin
  $x0 = [Math]::Max(0, [int](($minX - $pad) * $scale))
  $y0 = [Math]::Max(0, [int](($minY - $pad) * $scale))
  $x1 = [Math]::Min($src.Width, [int](($maxX + 1 + $pad) * $scale))
  $y1 = [Math]::Min($src.Height, [int](($maxY + 1 + $pad) * $scale))
  return @{ X = $x0; Y = $y0; W = ($x1 - $x0); H = ($y1 - $y0) }
}

# Trims to content, scales preserving aspect ratio to fit within (maxW, maxH), and
# composites the result centered horizontally / bottom-aligned onto a canvas of exactly
# (canvasW, canvasH) so the output is always a clean multiple of the 48px tile grid.
function Build-Object([System.Drawing.Bitmap]$frameCrop, [int]$canvasW, [int]$canvasH) {
  $bbox = Get-AlphaBoundingBox $frameCrop
  $trimmed = Crop $frameCrop $bbox.X $bbox.Y $bbox.W $bbox.H
  $scale = [Math]::Min($canvasW / $trimmed.Width, $canvasH / $trimmed.Height)
  $fitW = [Math]::Max(1, [int]($trimmed.Width * $scale))
  $fitH = [Math]::Max(1, [int]($trimmed.Height * $scale))
  $resized = Resize-HighQuality $trimmed $fitW $fitH
  $trimmed.Dispose()

  $canvas = New-TransparentBitmap $canvasW $canvasH
  $g = [System.Drawing.Graphics]::FromImage($canvas)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $destX = [int](($canvasW - $fitW) / 2)
  $destY = $canvasH - $fitH
  $g.DrawImage($resized, $destX, $destY, $fitW, $fitH)
  $g.Dispose()
  $resized.Dispose()
  return $canvas
}

function Frame-Rect($frame) {
  return @{ X = $frame.frame.x; Y = $frame.frame.y; W = $frame.frame.w; H = $frame.frame.h }
}

$frames = $manifest.frames.PSObject.Properties
$groundMap = @{
  "Sand"       = "sand.png"
  "dirt-path"  = "dirt-path.png"
  "grass"      = "grass.png"
  "water"      = "water.png"
  "stone"      = "stone.png"
  "wood"       = "wood.png"
  "tall-grass" = "tall-grass.png"
}

foreach ($f in $frames) {
  $name = $f.Name
  $rect = Frame-Rect $f.Value
  $crop = Crop $atlas $rect.X $rect.Y $rect.W $rect.H

  $groundKey = $groundMap.Keys | Where-Object { $name -eq $_ -or $name.StartsWith("$_-") } | Select-Object -First 1
  if ($groundKey) {
    $out = Resize-HighQuality $crop 48 48
    $outPath = Join-Path $outDir $groundMap[$groundKey]
    $out.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Output "wrote $outPath (48x48, from '$name')"
    $out.Dispose()
  } elseif ($name -eq "palm-tree") {
    $out = Build-Object $crop 48 96
    $outPath = Join-Path $outDir "palm-tree.png"
    $out.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Output "wrote $outPath (48x96, from '$name')"
    $out.Dispose()
  } else {
    # The one remaining unnamed-UUID frame is the campfire.
    $out = Build-Object $crop 48 48
    $outPath = Join-Path $outDir "fire.png"
    $out.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    Write-Output "wrote $outPath (48x48, from '$name')"
    $out.Dispose()
  }
  $crop.Dispose()
}

$atlas.Dispose()
Write-Output "done"
