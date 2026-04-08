//onboarding step
const step1 = "https://res.cloudinary.com/do1umjfkm/image/upload/v1775630550/1_ee4hjk.png";
const step2 = "https://res.cloudinary.com/do1umjfkm/image/upload/v1775630559/2_degwfg.png";
const step3 = "https://res.cloudinary.com/do1umjfkm/image/upload/v1775630571/3_e4alva.png";

//uzaro logo
const uzaroLogo = "https://res.cloudinary.com/do1umjfkm/image/upload/v1775631089/Untitled_design_bzu2wg.png";


type StringMap = { [key: string]: string };

export const imageMaps: {
  onboarding: StringMap;
  uzaro: StringMap;
} = {
  onboarding: {
    step1,
    step2,
    step3,
  },
  uzaro: {
   uzaroLogo,
  },
};

export const getImage = (
    mapper: "onboarding" | "uzaro", 
    filename: string) => {
  return (imageMaps[mapper] as any)?.[filename] || null;
};
