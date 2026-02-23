import { mediaKeys } from "./keys";
import axiosInstance from "../../utils/axios-instance";
import type { ApiResponse } from "../../pages/types/api-response";

export interface UploadImagePayload {
  file: File;
  /**
   * The backend can use this to store images in different buckets/folders.
   */
  context?: string;
}

export interface UploadImageResponse {
  url: string;
}

export const mediaMutation = () => {
  const uploadImageMutation = {
    mutationKey: mediaKeys.uploadImage(),
    mutationFn: async ({
      file,
      context,
    }: UploadImagePayload): Promise<string> => {
      const formData = new FormData();
      formData.append("file", file, file.name);
      if (context) formData.append("context", context);

      const response = await axiosInstance.post<
        ApiResponse<UploadImageResponse>
      >("/media/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      return response.data.data.url;
    },
  };

  return { uploadImageMutation };
};
