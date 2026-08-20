import { mobileApi } from '../api/client';
import type { Locale } from '../api/types';

// The API hands out a signed URL and never sees the bytes. The object has to exist before
// the review references it, so completion is the last step and a failure anywhere leaves no
// half-attached photograph behind -- the caller simply has no id to use.
export async function uploadPhoto(uri:string, locale:Locale):Promise<string> {
  const response=await fetch(uri);
  const blob=await response.blob();
  const mimeType=blob.type||'image/jpeg';
  const {id,upload}=await mobileApi.createUpload(mimeType,blob.size,locale);
  const put=await fetch(upload.upload_url,{method:'PUT',headers:{...upload.headers,'Content-Type':mimeType},body:blob});
  if(!put.ok)throw new Error(`upload failed: ${put.status}`);
  await mobileApi.completeUpload(id,locale);
  return id;
}
