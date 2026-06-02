# Self-healing SSH Tunnel script using localhost.run

$Port = 5173
$UrlFile = "tunnel-url.txt"

# Clean up old url file
if (Test-Path $UrlFile) {
    Remove-Item $UrlFile
}

Write-Output "Starting SSH Tunnel loop on port $Port..."

while ($true) {
    Write-Output "Connecting to localhost.run..."
    
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = "ssh"
    $processInfo.Arguments = "-o StrictHostKeyChecking=no -R 80:localhost:$Port nokey@localhost.run"
    $processInfo.RedirectStandardOutput = $true
    $processInfo.RedirectStandardError = $true
    $processInfo.UseShellExecute = $false
    $processInfo.CreateNoWindow = $true

    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $processInfo
    
    try {
        $process.Start() | Out-Null
    } catch {
        Write-Error "Failed to start SSH process: $_"
        Start-Sleep -Seconds 10
        continue
    }

    $reader = $process.StandardOutput
    $errReader = $process.StandardError
    
    $urlFound = $false
    while (-not $reader.EndOfStream) {
        $line = $reader.ReadLine()
        Write-Output "SSH: $line"
        
        # Regex to capture only the actual tunnel URL ending in .lhr.life or .lhr.rocks
        if ($line -match "https://[a-zA-Z0-9\-]+\.(lhr\.life|lhr\.rocks)") {
            $url = $Matches[0]
            Write-Output "Successfully established tunnel! URL: $url"
            $url | Out-File -FilePath $UrlFile -Encoding utf8
            $urlFound = $true
        }
    }

    # If the process exited or stream ended
    $process.WaitForExit()
    $exitCode = $process.ExitCode
    $errOutput = $errReader.ReadToEnd()
    Write-Output "SSH process exited with code $exitCode. Error: $errOutput"
    
    Write-Output "Tunnel disconnected. Restarting in 5 seconds..."
    Start-Sleep -Seconds 5
}
