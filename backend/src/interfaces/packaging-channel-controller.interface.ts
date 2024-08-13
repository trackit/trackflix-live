export interface PackagingChannel {
    name: string;
    groupName: string | undefined,
}

export interface PackagingChannelController {
    create(name: string, groupName: string | undefined): Promise<PackagingChannel>,
    list(groupName: string | undefined): Promise<PackagingChannel[]>,
    delete(name: string, groupName: string | undefined): void,
}
