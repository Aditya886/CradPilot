import { t } from "../languages/Translate";

export interface SignUpForm {
    firstName: string;
    lastName: string;
    email: string;
    language: string;
    country: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }

interface LoginForm {
    email: string;
    password: string; 
  }

interface serviceForm {
    name: any;
    serviceCategory: string;
    metaData: any;
    generalPrice: number;
    discountedPrice: number;
    duration: number;
    description: any;
    isPublic: boolean;
  }

export const validService = (form: serviceForm) => {
  const {
    name,
    serviceCategory,
    metaData,
    generalPrice,
    duration,
    description,
  }= form;

  if (
    !name.en ||
    !name.ar ||
    !serviceCategory ||
    (!generalPrice && (!metaData.priceforSedan || !metaData.priceforSUV)) ||
    !duration ||
    !description.en ||
    !description.ar
  ) return t("validation.all");
  
}

  export const validateLogin = (form: LoginForm): string | null => {
    const { email, password } = form;
  console.log(form);
  
    if ( !email || !password ) {
      return t("validation.all");
    }
    if ( !email ) {
      return t("validation.mail");
    }
    if ( !password ) {
      return t("validation.password");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
    // const isEmail = emailRegex.test(name);
    const isemail = emailRegex.test(email.trim());

    if(!isemail) return t("validation.validEmail")
  
    return null; // No error
  };

  export const createValidation = (data:any) => {
    const {background_sound_id, duration, prompt, guide_id, style_id} = data;

    if(!background_sound_id && !duration && !prompt && !guide_id && !style_id) return t("validation.all")
    if(!background_sound_id) return t("validation.bg")
    if(!duration) return t("validation.dur")
    if(!prompt) return t("validation.text")
    if(!guide_id) return t("validation.guide")
    if(!style_id) return t("validation.type")
  }
  
  export const validateSignUp = (form: SignUpForm): string | null => {
    const { firstName, password, email, confirmPassword, country } = form;
  
    if (!firstName && !password && !email && !confirmPassword && !country) return t("validation.all");
    if (!firstName) return t("validation.firstName");
    if (!email) return t("validation.mail");
    if (!password) return t("validation.password");
    if (!confirmPassword) return t("validation.confirm")
    if (!country) return t("validation.country")
  
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const nameRegex = /^(?! )[a-zA-ZÀ-ÿ]+(?: [a-zA-ZÀ-ÿ]+){0,2} ?$/;
    const passwordRegex = /^.{6,}$/;

    const isEmail = emailRegex.test(email.trim());
    const isPassword = passwordRegex.test(password.trim());
    const isConfirmPassword = confirmPassword === password 
    const isName = nameRegex.test(firstName.trim());


    if (!isEmail) return t("validation.validEmail")

    if (!isPassword) return t("validation.passLength");

    if (!isConfirmPassword) return t("validation.notMatch");

    if (!isName) return t("validation.validFirst");

    return null;
  };