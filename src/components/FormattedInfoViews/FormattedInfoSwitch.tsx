import { FormattedIpOwnership } from "./IpOwnership"
import { IPOwnershipFormatResponse } from "@/types/formatters";

export function FormattedInfoSwitch({ formattedInfo }: { formattedInfo: FormattedInfo_SB }) {
    switch (formattedInfo.type) {
        case "ip_ownership":
            return (<FormattedIpOwnership
                data={ formattedInfo.data as IPOwnershipFormatResponse }
            />);
        default:
            return <div>Unknown type </div>;
    }

}

