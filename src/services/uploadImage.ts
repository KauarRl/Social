export async function uploadImageToCloudinary(photoUri: string): Promise<string> {
  const formData = new FormData();
  formData.append('file', {
    uri: photoUri,
    type: 'image/jpeg',
    name: `profile_${Date.now()}.jpg`,
  });
  formData.append('upload_preset', 'vex_profile_photos');

  const cloudName = 'dvrqkw4mt';
  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    },
  );

  const data = await response.json();
  const imageUrl = data.secure_url;

  if (!imageUrl) {
    throw new Error('Falha ao enviar imagem');
  }

  return imageUrl;
}
