import { useContactForm } from "../api/useContactForm";

export default function ContactForm() {
  const { formData, handleChange, handleSubmit, loading } =
    useContactForm();

  return (
    <div className="container mt-5">
      <div className="card p-4 shadow">
        <h4 className="text-center mb-4">
          Form Submission to Google Sheet
        </h4>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          <div className="mb-3">
            <label>Name:</label>
            <input
              className="form-control"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label>Email:</label>
            <input
              className="form-control"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label>Contact Number:</label>
            <input
              className="form-control"
              type="text"
              name="contact_number"
              value={formData.contact_number}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-3">
            <label>Gender:</label>
            <select
              className="form-control"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              required
            >
              <option value="">Choose...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>

          <div className="mb-3">
            <label>Message:</label>
            <textarea
              className="form-control"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-check mb-2">
            <input
              className="form-check-input"
              type="checkbox"
              name="age"
              checked={formData.age}
              onChange={handleChange}
            />
            <label className="form-check-label">
              Over 18 years old
            </label>
          </div>

          <div className="form-check mb-3">
            <input
              className="form-check-input"
              type="checkbox"
              name="ex"
              checked={formData.ex}
              onChange={handleChange}
              required
            />
            <label className="form-check-label">
              Agree to terms
            </label>
          </div>

          <button
            className="btn btn-primary w-100"
            type="submit"
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
}
