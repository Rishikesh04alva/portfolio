Add-Type -AssemblyName System.Drawing

$outDir = "C:\Rishikesh portfolio website\contact-card\icons"
New-Item -ItemType Directory -Force -Path $outDir | Out-Null

function New-Icon {
  param([int]$size, [string]$path, [double]$scaleR, [double]$dotScale = 0)
  $bmp = New-Object System.Drawing.Bitmap($size, $size)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $g.Clear([System.Drawing.Color]::FromArgb(255, 10, 11, 14))

  $pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(70, 0, 240, 255), [Math]::Max(2, $size / 100))
  $g.DrawRectangle($pen, [Math]::Max(1, $size/160), [Math]::Max(1, $size/160), $size - [Math]::Max(2, $size/80), $size - [Math]::Max(2, $size/80))

  $font = New-Object -TypeName System.Drawing.Font -ArgumentList @('Arial', [single]($size * $scaleR), [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
  $brush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 0, 240, 255))
  $sf = New-Object System.Drawing.StringFormat
  $sf.Alignment = [System.Drawing.StringAlignment]::Center
  $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

  $off = $size * 0.015
  $rect = New-Object System.Drawing.RectangleF(0, $off, $size, $size)
  $g.DrawString("R", $font, $brush, $rect, $sf)

  if ($dotScale -gt 0) {
    $d = $size * $dotScale
    $dBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 16, 185, 129))
    $cx = $size * 0.52
    $cy = $size * 0.60
    $g.FillEllipse($dBrush, $cx - $d/2, $cy - $d/2, $d, $d)
    $dBrush.Dispose()
  }

  $g.Dispose()
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
  Write-Output "wrote $path"
}

New-Icon -size 512 -path "$outDir\icon-512.png" -scaleR 0.62
New-Icon -size 192 -path "$outDir\icon-192.png" -scaleR 0.62
New-Icon -size 180 -path "$outDir\apple-touch-icon.png" -scaleR 0.62
New-Icon -size 512 -path "$outDir\icon-512-maskable.png" -scaleR 0.42 -dotScale 0.035
