import { Group, Text } from "@mantine/core";

import { ExtractJobStatus } from "@/types/enums";
import { formatDistanceToNow } from 'date-fns';

interface TimeAgoProps {
    job?: ExtractJob_SB
}

function statusIcon(status: ExtractJobStatus) {
switch (status) {
    case ExtractJobStatus.RUNNING:
        return '⏳';
    case ExtractJobStatus.FAILED:
        return '❌';
    case 'complete':
        return '✅';
    default:
        return '';
}

}

const JobInfo: React.FC<TimeAgoProps> = ({ job }) => {
    if (!job) return null;
    const timeAgo = formatDistanceToNow(new Date(job.updated_at), { addSuffix: true });

    return (<Group>
        {statusIcon(job.status as ExtractJobStatus)}
        <Text size='sm' c={"dimmed"}>{timeAgo}</Text>
    </Group>)
};

export default JobInfo;