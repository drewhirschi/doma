// import { ActionIcon, Group, MantineProvider, Paper } from "@mantine/core";
// import { IconCopy, IconTrash, IconViewfinder } from "@tabler/icons-react";

// import { Editor } from "@tiptap/core";
// import ReactDOM from "react-dom";
// import { createRoot } from "react-dom/client";
// import { useRouter } from "next/navigation";

// // import { Tooltip } from "@docs.plus/extension-hyperlink";



// export type THyperlinkPreviewModalOptions = {
//     editor: Editor;
//     validate?: (url: string) => boolean;
//     link: HTMLAnchorElement;
//     node?: any;
//     nodePos: number;
//     tippy: Tooltip;
// };

// export function linkPreviewToolTip(options: THyperlinkPreviewModalOptions): HTMLElement {
//     // const href = options.link.href;


//     // const hyperlinkModal = document.createElement("div");
//     // const root = createRoot(hyperlinkModal);
//     // root.render(<MantineProvider>
//     //     <Paper shadow="lg" p={"sm"}>
//     //         <Group>
//     //             <ActionIcon variant="default" onClick={() => {
//     //                 window.history.replaceState(null, '', href);
//     //                 window.dispatchEvent(new HashChangeEvent('hashchange'));

//     //                 options.tippy.hide();
//     //             }}>

//     //                 <IconViewfinder />
//     //             </ActionIcon>
//     //             <ActionIcon variant="default" onClick={() => {
//     //                 navigator.clipboard.writeText(href);
//     //                 options.tippy.hide();
//     //             }}>

//     //                 <IconCopy />
//     //             </ActionIcon>
//     //             <ActionIcon variant="default" onClick={() => {
//     //                 // options.editor.chain().focus().unsetHyerlink().run()
//     //                 // options.tippy.hide();
//     //             }}>

//     //                 <IconTrash />
//     //             </ActionIcon>
//     //         </Group>
//     //     </Paper>
//     // </MantineProvider>)

//     // return hyperlinkModal;
//     return <></>
// }
