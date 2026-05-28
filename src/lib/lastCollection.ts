export function setLastCollectionCookie(id: string) {
  document.cookie = `last-collection=${id};path=/admin;max-age=31536000`;
}

export function setLastSettingsCookie(route: string) {
  document.cookie = `last-settings=${route};path=/admin;max-age=31536000`;
}
