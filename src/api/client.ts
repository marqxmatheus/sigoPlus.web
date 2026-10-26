import axios from 'axios'

export type ApiErrorBody = {
  erro?: string
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
})

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorBody>(error)) {
    if (error.response?.data.erro) {
      return error.response.data.erro
    }

    if (!error.response) {
      return 'Não foi possível conectar à API. Verifique se o servidor está em execução.'
    }
  }

  return 'Ocorreu um erro inesperado. Tente novamente.'
}
