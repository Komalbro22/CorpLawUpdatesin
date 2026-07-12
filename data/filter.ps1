$data = Get-Content "C:\Users\KOMALPRRET\Desktop\CorpLawUpdates\data\penalty-provisions.json" | ConvertFrom-Json
$filtered = $data | Where-Object { $_.sno -ge 121 -and $_.sno -le 135 }
$filtered | ConvertTo-Json -Depth 10 | Set-Content "C:\Users\KOMALPRRET\Desktop\CorpLawUpdates\data\filtered_121_135.json"
