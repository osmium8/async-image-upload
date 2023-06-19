export function padTo2Digits(num: number) {
    return num.toString().padStart(2, '0');
}

export function formatDate(date: any) {
    return [
        padTo2Digits(date.getDate()),
        padTo2Digits(date.getMonth() + 1),
        date.getFullYear(),
    ].join('-');
}