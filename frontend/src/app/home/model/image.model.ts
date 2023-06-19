export interface Image extends Object {
    id?: number,
    url?: string,
    thumbnail_url?: string,
    title: string,
    description: string,
    image_file?: File,
    date_uploaded?: string
}