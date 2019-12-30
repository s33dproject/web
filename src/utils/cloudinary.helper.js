const baseUrl = "https://res.cloudinary.com/s33d/image/upload";
const folder = "artworks";

export const getFeedSrc = name =>
  `${baseUrl}/f_png,w_300,h_300/${folder}/${name}`;

export const getSrc = name => `${baseUrl}/f_png/${folder}/${name}`;

export const getThumbSrc = name =>
  `${baseUrl}/f_jpg,t_media_lib_thumb/${folder}/${name}`;
