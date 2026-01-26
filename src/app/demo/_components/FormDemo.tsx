"use client";

import { Hash, Mail, User } from "lucide-react";
import { useState } from "react";

import { Form } from "@/components/form";
import type { SelectOption } from "@/types/Form";

// Calculate min date for 13+ years old (outside component to avoid impure function call)
const minThirteenYearsAgo = new Date(
  Date.now() - 13 * 365 * 24 * 60 * 60 * 1000,
)
  .toISOString()
  .split("T")[0];
const today = new Date().toISOString().split("T")[0];

export function FormDemo() {
  const [files, setFiles] = useState<File[]>([]);

  const roleOptions: SelectOption[] = [
    { value: "player", label: "Player" },
    { value: "admin", label: "Admin" },
    { value: "moderator", label: "Moderator" },
    { value: "spectator", label: "Spectator" },
  ];

  const serverOptions: SelectOption[] = [
    { value: "server1", label: "GCL Indonesia #1" },
    { value: "server2", label: "GCL Indonesia #2" },
    { value: "server3", label: "GCL Indonesia #3" },
  ];

  return (
    <div className="space-y-12">
      {/* Text Inputs */}
      <section>
        <h2 className="text-2xl font-display font-bold text-primary-100 mb-6">
          Text Inputs
        </h2>
        <div className="space-y-6">
          <Form.Text
            name="username"
            label="Username"
            placeholder="Enter your username"
            prefix={<User size={18} />}
            required
            helperText="Choose a unique username for your account"
          />

          <Form.Text
            name="email"
            type="email"
            label="Email Address"
            placeholder="you@example.com"
            prefix={<Mail size={18} />}
            required
            helperText="We'll never share your email with anyone else"
          />

          <Form.Text
            name="password"
            type="password"
            label="Password"
            placeholder="Enter a secure password"
            required
            helperText="Must be at least 8 characters long"
          />

          <Form.Text
            name="search"
            type="search"
            label="Search Players"
            placeholder="Search by name or ID..."
          />

          <Form.Text
            name="disabled-text"
            label="Disabled Field"
            placeholder="This field is disabled"
            disabled
            helperText="You cannot edit this field"
          />

          <Form.Text
            name="error-text"
            label="Error State"
            placeholder="Enter value"
            error="This field has an error"
            helperText="Please fix the error above"
          />

          {/* Text Sizes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Text
              name="text-sm"
              label="Small Text Input"
              size="sm"
              placeholder="Small size"
            />
            <Form.Text
              name="text-md"
              label="Medium Text Input"
              size="md"
              placeholder="Medium size"
            />
            <Form.Text
              name="text-lg"
              label="Large Text Input"
              size="lg"
              placeholder="Large size"
            />
            <Form.Text
              name="text-xl"
              label="Extra Large Text Input"
              size="xl"
              placeholder="Extra large size"
            />
          </div>
        </div>
      </section>

      {/* Number Inputs */}
      <section>
        <h2 className="text-2xl font-display font-bold text-primary-100 mb-6">
          Number Inputs
        </h2>
        <div className="space-y-6">
          <Form.Number
            name="age"
            label="Age"
            placeholder="Enter your age"
            min={13}
            max={100}
            helperText="Must be between 13 and 100"
          />

          <Form.Number
            name="rank"
            label="Rank Position"
            placeholder="Enter rank"
            prefix={<Hash size={18} />}
            suffix="#"
            min={1}
          />

          <Form.Number
            name="rating"
            label="Rating"
            placeholder="0-100"
            min={0}
            max={100}
            step={1}
            helperText="Your competitive rating"
          />

          <Form.Number
            name="kd-ratio"
            label="K/D Ratio"
            placeholder="0.00"
            min={0}
            max={10}
            step={0.01}
            defaultValue={1.5}
          />

          {/* Number Sizes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Number
              name="num-sm"
              label="Small"
              size="sm"
              placeholder="0"
            />
            <Form.Number
              name="num-md"
              label="Medium"
              size="md"
              placeholder="0"
            />
            <Form.Number
              name="num-lg"
              label="Large"
              size="lg"
              placeholder="0"
            />
            <Form.Number
              name="num-xl"
              label="Extra Large"
              size="xl"
              placeholder="0"
            />
          </div>
        </div>
      </section>

      {/* Select Inputs */}
      <section>
        <h2 className="text-2xl font-display font-bold text-primary-100 mb-6">
          Select Dropdowns
        </h2>
        <div className="space-y-6">
          <Form.Select
            name="role"
            label="Role"
            options={roleOptions}
            placeholder="Select a role"
            required
            helperText="Choose your primary role"
          />

          <Form.Select
            name="server"
            label="Preferred Server"
            options={serverOptions}
            placeholder="Choose a server"
          />

          <Form.Select
            name="region"
            label="Region"
            options={[
              { value: "asia", label: "Asia" },
              { value: "eu", label: "Europe" },
              { value: "na", label: "North America" },
              { value: "sa", label: "South America" },
            ]}
            placeholder="Select your region"
          />

          <Form.Select
            name="disabled-select"
            label="Disabled Select"
            options={roleOptions}
            disabled
            placeholder="Cannot select"
          />

          <Form.Select
            name="error-select"
            label="Error State"
            options={roleOptions}
            error="Please select a valid option"
          />

          {/* Select Sizes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Select
              name="sel-sm"
              label="Small"
              size="sm"
              options={roleOptions}
              placeholder="Small"
            />
            <Form.Select
              name="sel-md"
              label="Medium"
              size="md"
              options={roleOptions}
              placeholder="Medium"
            />
            <Form.Select
              name="sel-lg"
              label="Large"
              size="lg"
              options={roleOptions}
              placeholder="Large"
            />
            <Form.Select
              name="sel-xl"
              label="XL"
              size="xl"
              options={roleOptions}
              placeholder="XL"
            />
          </div>
        </div>
      </section>

      {/* Date Inputs */}
      <section>
        <h2 className="text-2xl font-display font-bold text-primary-100 mb-6">
          Date Pickers
        </h2>
        <div className="space-y-6">
          <Form.Date
            name="birthdate"
            label="Birth Date"
            helperText="Must be at least 13 years old"
            max={minThirteenYearsAgo}
          />

          <Form.Date
            name="tournament-date"
            label="Tournament Date"
            helperText="Select when you want to participate"
            min={today}
          />

          <Form.Date
            name="join-date"
            label="Join Date"
            helperText="When did you join GCLI?"
          />

          {/* Date Sizes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Date name="date-sm" label="Small" size="sm" />
            <Form.Date name="date-md" label="Medium" size="md" />
            <Form.Date name="date-lg" label="Large" size="lg" />
            <Form.Date name="date-xl" label="XL" size="xl" />
          </div>
        </div>
      </section>

      {/* DateTime Inputs */}
      <section>
        <h2 className="text-2xl font-display font-bold text-primary-100 mb-6">
          Date & Time Pickers
        </h2>
        <div className="space-y-6">
          <Form.Date
            name="match-start"
            label="Match Start Time"
            helperText="Select when the match begins (24-hour format)"
            enableTime
            placeholder="Select match date and time..."
          />

          <Form.Date
            name="training-schedule"
            label="Training Schedule"
            helperText="Schedule your training session (12-hour format)"
            enableTime
            hour12
            placeholder="Select date and time..."
          />

          <Form.Date
            name="event-datetime"
            label="Event Date & Time"
            helperText="When should the event start?"
            enableTime
            min={today}
            placeholder="Select event date and time..."
          />

          {/* DateTime Sizes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Date
              name="datetime-sm"
              label="Small (24h)"
              size="sm"
              enableTime
            />
            <Form.Date
              name="datetime-md-12h"
              label="Medium (12h)"
              size="md"
              enableTime
              hour12
            />
            <Form.Date
              name="datetime-lg"
              label="Large (24h)"
              size="lg"
              enableTime
            />
            <Form.Date
              name="datetime-xl-12h"
              label="XL (12h)"
              size="xl"
              enableTime
              hour12
            />
          </div>
        </div>
      </section>

      {/* Textarea */}
      <section>
        <h2 className="text-2xl font-display font-bold text-primary-100 mb-6">
          Textareas
        </h2>
        <div className="space-y-6">
          <Form.Textarea
            name="bio"
            label="Bio"
            placeholder="Tell us about yourself..."
            rows={4}
            maxLength={500}
            helperText="Max 500 characters"
          />

          <Form.Textarea
            name="reason"
            label="Why do you want to join?"
            placeholder="Explain your motivation..."
            rows={6}
            required
            helperText="This helps us understand your goals"
          />

          <Form.Textarea
            name="notes"
            label="Additional Notes"
            placeholder="Any other information..."
            resize="both"
            rows={3}
          />

          <Form.Textarea
            name="fixed-textarea"
            label="Fixed Size Textarea"
            placeholder="This cannot be resized..."
            resize="none"
            rows={4}
          />

          {/* Textarea Sizes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Textarea
              name="ta-sm"
              label="Small"
              size="sm"
              rows={3}
              placeholder="Small"
            />
            <Form.Textarea
              name="ta-md"
              label="Medium"
              size="md"
              rows={3}
              placeholder="Medium"
            />
            <Form.Textarea
              name="ta-lg"
              label="Large"
              size="lg"
              rows={3}
              placeholder="Large"
            />
            <Form.Textarea
              name="ta-xl"
              label="XL"
              size="xl"
              rows={3}
              placeholder="XL"
            />
          </div>
        </div>
      </section>

      {/* Radio Inputs */}
      <section>
        <h2 className="text-2xl font-display font-bold text-primary-100 mb-6">
          Radio Inputs
        </h2>
        <div className="space-y-6">
          <Form.Radio
            name="experience"
            label="Experience Level"
            options={[
              { value: "beginner", label: "Beginner" },
              { value: "intermediate", label: "Intermediate" },
              { value: "advanced", label: "Advanced" },
              { value: "expert", label: "Expert" },
            ]}
            helperText="Select your current skill level"
          />

          <Form.Radio
            name="playstyle"
            label="Playstyle"
            orientation="horizontal"
            options={[
              { value: "aggressive", label: "Aggressive" },
              { value: "defensive", label: "Defensive" },
              { value: "balanced", label: "Balanced" },
            ]}
          />

          <Form.Radio
            name="server-region"
            label="Preferred Server Region"
            options={[
              {
                value: "asia",
                label: "Asia",
                description: "Low latency for Southeast Asian players",
              },
              {
                value: "eu",
                label: "Europe",
                description: "Best for European players",
              },
              {
                value: "na",
                label: "North America",
                description: "Optimal for North American players",
              },
            ]}
            helperText="Choose the server closest to your location"
          />

          <Form.Radio
            name="disabled-radio"
            label="Disabled Radio Group"
            options={[
              { value: "option1", label: "Option 1" },
              { value: "option2", label: "Option 2" },
            ]}
            disabled
          />

          <Form.Radio
            name="error-radio"
            label="Error State"
            options={[
              { value: "yes", label: "Yes" },
              { value: "no", label: "No" },
            ]}
            error="Please select an option"
          />

          {/* Radio Sizes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Radio
              name="radio-sm"
              label="Small"
              size="sm"
              options={[
                { value: "a", label: "Option A" },
                { value: "b", label: "Option B" },
              ]}
            />
            <Form.Radio
              name="radio-md"
              label="Medium"
              size="md"
              options={[
                { value: "a", label: "Option A" },
                { value: "b", label: "Option B" },
              ]}
            />
            <Form.Radio
              name="radio-lg"
              label="Large"
              size="lg"
              options={[
                { value: "a", label: "Option A" },
                { value: "b", label: "Option B" },
              ]}
            />
            <Form.Radio
              name="radio-xl"
              label="XL"
              size="xl"
              options={[
                { value: "a", label: "Option A" },
                { value: "b", label: "Option B" },
              ]}
            />
          </div>
        </div>
      </section>

      {/* Checkboxes */}
      <section>
        <h2 className="text-2xl font-display font-bold text-primary-100 mb-6">
          Checkboxes
        </h2>
        <div className="space-y-6">
          <Form.Checkbox
            name="terms"
            label="I agree to the terms and conditions"
            helperText="You must accept the terms to continue"
          />

          <Form.Checkbox
            name="newsletter"
            label="Subscribe to our newsletter"
            defaultChecked
            helperText="Get the latest updates and announcements"
          />

          <Form.Checkbox
            name="notifications"
            label="Enable push notifications"
            helperText="Receive notifications about matches and events"
          />

          <Form.Checkbox
            name="public-profile"
            label="Make my profile public"
            helperText="Allow other players to see your profile"
          />

          <Form.Checkbox
            name="data-sharing"
            label="Allow data sharing with partners"
            helperText="Help us improve by sharing anonymous data"
          />

          <Form.Checkbox
            name="disabled-checkbox"
            label="Disabled checkbox"
            disabled
          />

          <Form.Checkbox
            name="error-checkbox"
            label="I confirm the information is correct"
            error="You must confirm to proceed"
          />

          <Form.Checkbox
            name="indeterminate"
            label="Indeterminate state"
            indeterminate
            helperText="Used for loading/processing states"
          />

          {/* Checkbox Sizes */}
          <div className="space-y-4">
            <Form.Checkbox name="cb-sm" label="Small checkbox" size="sm" />
            <Form.Checkbox name="cb-md" label="Medium checkbox" size="md" />
            <Form.Checkbox name="cb-lg" label="Large checkbox" size="lg" />
            <Form.Checkbox name="cb-xl" label="XL checkbox" size="xl" />
          </div>
        </div>
      </section>

      {/* Dropzone */}
      <section>
        <h2 className="text-2xl font-display font-bold text-primary-100 mb-6">
          File Upload (Dropzone)
        </h2>
        <div className="space-y-6">
          <Form.Dropzone
            name="screenshot"
            label="Upload Screenshot"
            accept="image/png,image/jpeg,image/webp"
            validation={{
              maxSize: 5 * 1024 * 1024, // 5MB
              allowedTypes: ["image/png", "image/jpeg", "image/webp"],
              maxFiles: 3,
            }}
            multiple
            onFilesChange={(newFiles) => setFiles(newFiles)}
            helperText="Upload up to 3 screenshots (max 5MB each)"
          />

          <Form.Dropzone
            name="replay"
            label="Upload Replay File"
            accept=".json"
            validation={{
              maxSize: 10 * 1024 * 1024, // 10MB
              allowedTypes: ["application/json"],
              maxFiles: 1,
            }}
            onFilesChange={(newFiles) =>
              console.error("Replay files:", newFiles)
            }
            helperText="Upload the game replay file (JSON, max 10MB)"
          />

          <Form.Dropzone
            name="disabled-dropzone"
            label="Disabled Dropzone"
            disabled
            helperText="File uploads are currently disabled"
          />

          {/* Dropzone Sizes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Form.Dropzone
              name="dz-sm"
              label="Small"
              size="sm"
              onFilesChange={(f) => console.error("Small:", f)}
            />
            <Form.Dropzone
              name="dz-md"
              label="Medium"
              size="md"
              onFilesChange={(f) => console.error("Medium:", f)}
            />
            <Form.Dropzone
              name="dz-lg"
              label="Large"
              size="lg"
              onFilesChange={(f) => console.error("Large:", f)}
            />
            <Form.Dropzone
              name="dz-xl"
              label="XL"
              size="xl"
              onFilesChange={(f) => console.error("XL:", f)}
            />
          </div>
        </div>
      </section>

      {/* Combined Form Example */}
      <section>
        <h2 className="text-2xl font-display font-bold text-primary-100 mb-6">
          Complete Form Example
        </h2>
        <div className="bg-primary-900 rounded-lg p-6 border border-primary-500">
          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              console.error("Form submitted", { files });
            }}
          >
            <Form.Text
              name="reg-username"
              label="Username"
              placeholder="Choose a username"
              prefix={<User size={18} />}
              required
            />

            <Form.Text
              name="reg-email"
              type="email"
              label="Email"
              placeholder="your@email.com"
              prefix={<Mail size={18} />}
              required
            />

            <Form.Number
              name="reg-age"
              label="Age"
              placeholder="Your age"
              min={13}
              max={100}
              required
            />

            <Form.Select
              name="reg-role"
              label="Preferred Role"
              options={roleOptions}
              placeholder="Select your role"
              required
            />

            <Form.Date
              name="reg-birthdate"
              label="Birth Date"
              helperText="You must be 13+ to join"
              max={minThirteenYearsAgo}
              required
            />

            <Form.Date
              name="reg-available-time"
              label="Available Start Time"
              helperText="When can you start playing?"
              enableTime
              hour12
            />

            <Form.Textarea
              name="reg-bio"
              label="Tell us about yourself"
              placeholder="Why do you want to join GCLI?"
              rows={4}
              required
            />

            <Form.Dropzone
              name="reg-files"
              label="Upload Profile Picture"
              accept="image/png,image/jpeg,image/webp"
              validation={{
                maxSize: 2 * 1024 * 1024,
                allowedTypes: ["image/png", "image/jpeg", "image/webp"],
                maxFiles: 1,
              }}
              onFilesChange={(f) => console.error("Profile pics:", f)}
              helperText="Upload a profile picture (max 2MB)"
            />

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                className="px-6 py-3 bg-secondary-700 text-white rounded-md hover:bg-secondary-800 transition-colors font-medium"
              >
                Submit Application
              </button>
              <button
                type="reset"
                className="px-6 py-3 bg-primary-300 text-primary-100 rounded-md hover:bg-primary-400 transition-colors font-medium"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
