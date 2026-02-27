import { Box, Progress, Text } from '@radix-ui/themes'
import { DexProgress } from '@openhome-core/progression/dexProgress'

type RegionProgressPanelProps = {
  progress: DexProgress
}

export default function RegionProgressPanel({ progress }: RegionProgressPanelProps) {
  return (
    <Box style={{ width: 280, padding: 12, display: 'grid', gap: 12 }}>
      <Box style={{ display: 'grid', gap: 6 }}>
        <Text size="4">National</Text>
        <Text size="2">
          Caught {progress.nationalCaught} of {progress.nationalTotal}
        </Text>
        <Progress value={progress.nationalCaughtPct} />
        <Text size="1">
          Seen {progress.nationalSeen} of {progress.nationalTotal}
        </Text>
      </Box>

      <Box style={{ display: 'grid', gap: 12 }}>
        {progress.regions.map((r) => (
          <Box key={r.id} style={{ display: 'grid', gap: 6 }}>
            <Text size="3">{r.name}</Text>

            <Text size="2">
              Caught {r.caught} of {r.total}
            </Text>
            <Progress value={r.caughtPct} />

            <Text size="1">
              Seen {r.seen} of {r.total}
            </Text>
          </Box>
        ))}
      </Box>
    </Box>
  )
}