import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/axios";

// New license application and inquiry. Both are sent to /mobile/* and show up in
// the admin dashboard (New License and Inquiry lists).

export interface Province {
  name: string;
  districts: string[];
}

export interface MyRegistration {
  registration_id: string;
  status: "INITIATED" | "PROCESSING" | "COMPLETED";
  remarks: string;
  license_category: string;
  created_at: string;
  updated_at: string;
}

export interface ApplicationPayload {
  date_of_birth: string;
  gender: string;
  blood_group: string;
  father_name: string;
  mother_name: string;
  citizenship_no: string;
  license_category: string;
  province: string;
  district: string;
  municipality: string;
  ward_no: number | null;
  address: string; // permanent address
  contact_phone: string;
  current_province: string;
  current_district: string;
  current_municipality: string;
  current_ward_no: number | null;
  current_address: string;
  // citizenship / NID card photos (the API keeps them in the license_* fields)
  license_front_image: string;
  license_back_image: string;
  passport_photo: string;
}

export interface InquiryPayload {
  name: string;
  phone: string;
  email: string;
  help_type: string;
  message: string;
}

export const HELP_TYPES = [
  { value: "REGISTRATION", label: "Registration" },
  { value: "PRACTICE", label: "Practice" },
  { value: "TRIAL", label: "Trial" },
  { value: "INSTITUTE", label: "Institute" },
  { value: "OTHER", label: "Other" },
];

// the axios instance already unwraps response.data
export const useQueryLocations = () =>
  useQuery({
    queryKey: ["mobile-locations"],
    staleTime: Infinity,
    queryFn: async () => ((await api.get("/mobile/locations")) as unknown as { data: Province[] }).data,
  });

export const useQueryMyRegistration = () =>
  useQuery({
    queryKey: ["my-registration"],
    queryFn: async () =>
      ((await api.get("/mobile/registration")) as unknown as { data: MyRegistration | null }).data,
  });

/** Uploads one photo and returns its storage path for the application. */
export async function uploadPhoto(uri: string, mimeType?: string | null): Promise<string> {
  const png = mimeType === "image/png" || uri.toLowerCase().endsWith(".png");
  const form = new FormData();
  // React Native accepts this {uri,name,type} shape in place of a Blob
  form.append("file", {
    uri,
    name: png ? "photo.png" : "photo.jpg",
    type: png ? "image/png" : "image/jpeg",
  } as unknown as Blob);

  const res = (await api.post("/mobile/uploads", form, {
    headers: { "Content-Type": "multipart/form-data" },
    timeout: 60000,
    transformRequest: (data) => data,
  })) as unknown as { data: { path: string; url: string } };
  return res.data.path;
}

export const useSubmitApplication = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ApplicationPayload) => api.post("/mobile/registration", payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["my-registration"] }),
  });
};

export const useSendInquiry = () =>
  useMutation({ mutationFn: (payload: InquiryPayload) => api.post("/mobile/inquiries", payload) });
