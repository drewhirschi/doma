import { Badge, Tooltip } from "@mantine/core";

export function SimilarityBadge({ similarity }: { similarity: number }) {
  let color;
  let text;

  if (similarity > 0.7) {
    color = "green";
    text = "Very High";
  } else if (similarity > 0.6) {
    color = "green";
    text = "High";
  } else if (similarity > 0.5) {
    color = "lime";
    text = "Medium";
  } else if (similarity > 0.4) {
    color = "yellow";
    text = "Low";
  } else {
    color = "red";
    text = "Very Low";
  }

  return (
    <Tooltip label={similarity.toString()}>
      <Badge variant="light" color={color}>
        {text}
      </Badge>
    </Tooltip>
  );
}
