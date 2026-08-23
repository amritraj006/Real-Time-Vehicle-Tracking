/**
 * Submit contact form payload to Web3Forms API.
 * @param {FormData} formData - Web3Forms form data containing access_key, name, email, message
 */
export const submitContactForm = async (formData) => {
  const response = await fetch("https://api.web3forms.com/submit", {
    method: "POST",
    body: formData,
  });
  return response.json();
};
