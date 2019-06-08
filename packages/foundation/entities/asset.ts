export const AssetMetadataBookKind  = 'AssetMetadataBook'
export interface AssetMetadataBook {
    kind: typeof AssetMetadataBookKind
    coverImageURL: string
    title: string
    description?: string
    teaser?: string
    slug?: string
}

export const AssetMetadataEventKind = 'AssetMetadataEvent'
export interface AssetMetadataEvent {
    kind: typeof AssetMetadataEventKind
    eventURL: string
    title: string
    description?: string
}

export type AssetMetadata = AssetMetadataBook | AssetMetadataEvent