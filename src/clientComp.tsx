import { IconCheck, IconExclamationCircle } from "@tabler/icons-react";

import { IResp } from "./utils";
import { notifications } from "@mantine/notifications";
import { rem } from "@mantine/core";

export type ActionWithNotificationOptions = {
    title?: string,
    loadingMessage?: string,
    successMessage?: string,
    errorMessage?: string,
}
export async function actionWithNotification(task: () => Promise<IResp<any>>, options: ActionWithNotificationOptions) {
    const id = notifications.show({
        loading: true,
        title: options.title || 'In progress...',
        message: options.loadingMessage || '',
        autoClose: false,
        withCloseButton: false,
    });
    try {
        const taskRes = await task()
        if (taskRes.error) {
            throw taskRes.error
        }
        notifications.update({
            id,
            color: 'green',
            title: options.title || 'Success',
            message: options.successMessage || '',
            icon: <IconCheck style={{ width: rem(18), height: rem(18) }} />,
            loading: false,
            autoClose: 2000,
        });
    } catch (error) {

        notifications.update({
            id,
            color: 'red',
            title: options.title || 'Error',
            message: options.errorMessage || JSON.stringify(error),
            icon: <IconExclamationCircle style={{ width: rem(18), height: rem(18) }} />,
            loading: false,
            withCloseButton: true,
        });
    }

}