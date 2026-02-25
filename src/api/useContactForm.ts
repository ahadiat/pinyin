import { useState } from "react";

const scriptURL =
  "https://script.google.com/macros/s/AKfycbye2zeaTQYJOy6el_XIgR_mpFlLvwI-DZYKmH6MbuzatHcCCFz4CK0ckAiUTFNgKdHK/exec";

export interface ContactFormData {
  name: string;
  email: string;
  contact_number: string;
  gender: string;
  message: string;
  age: boolean;
  ex: boolean;
}

export const useContactForm = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    contact_number: "",
    gender: "",
    message: "",
    age: false,
    ex: false,
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("contact_number", formData.contact_number);
    data.append("gender", formData.gender);
    data.append("message", formData.message);
    data.append("age", formData.age ? "Yes" : "No");
    data.append("ex", formData.ex ? "Yes" : "No");

    try {
      await fetch(scriptURL, {
        method: "POST",
        body: data,
      });

      alert("Submitted Successfully!");

      // reset form
      setFormData({
        name: "",
        email: "",
        contact_number: "",
        gender: "",
        message: "",
        age: false,
        ex: false,
      });
    } catch (error) {
      alert("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return {
    formData,
    loading,
    handleChange,
    handleSubmit,
  };
};
