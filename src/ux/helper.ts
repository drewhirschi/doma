export function getInitials(name: string): string {
    if (!name) {
        return ""
    }
    const words = name.split(' ');
    const initials = words.map(word => word.charAt(0).toUpperCase());
    return initials.join('');
}

export function formatBytes(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(2)} ${sizes[i]}`;
}

export function getCompletedContracts(contracts: Contract_SB[], id: string): number {

    const completedContracts = contracts.reduce((count, contract) => {
        return count +
            (contract.completed && contract.assigned_to === id ? 1 : 0);
    }, 0)

    return completedContracts
}

export function getTotalContracts(contracts: Contract_SB[], id: string): number {

    const totalContracts = contracts.reduce((count, contract) => {
        return count +
            (contract.assigned_to === id ? 1 : 0);
    }, 0)

    return totalContracts
}