// Хранилище access-токена для сетевого сервиса. Один бессрочный токен, без refresh
// (docs/04, docs/07). Auth-фича вызывает setAuthToken() при логине/логауте.
let token: string | null = null;

export const setAuthToken = (value: string | null) => {
  token = value;
};
export const getAuthToken = () => token;
