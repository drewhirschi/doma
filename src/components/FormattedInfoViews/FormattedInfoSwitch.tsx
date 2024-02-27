import { FormattedIpOwnership } from "./IpOwnership"
import { IPOwnershipFormatResponse } from "@/types/formatters";

export function FormattedInfoSwitch({ formattedInfo }: { formattedInfo: (FormattedInfo_SB & {extracted_information: {id:string}[]}) }) {
    switch (formattedInfo.formatter_key) {
        case "ip_ownership":
            return (<FormattedIpOwnership
                data={ formattedInfo.data as unknown as IPOwnershipFormatResponse }
                extractedInfoRefs={formattedInfo.extracted_information.map((ei) => ei.id)}
            />);
        default:
            return <div>Unknown type </div>;
    }

}

