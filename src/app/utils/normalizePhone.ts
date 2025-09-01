import { parsePhoneNumberFromString } from "libphonenumber-js";

export default function normalizePhone(phone: string) {
  const phoneNumber = parsePhoneNumberFromString(phone, "BD"); // default country = Bangladesh
  return phoneNumber ? phoneNumber.number : phone; // always returns E.164 (+880...)
}
