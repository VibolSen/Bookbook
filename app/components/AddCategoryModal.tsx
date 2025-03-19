// components/AddCategoryModal.tsx
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { v4 as uuidv4 } from "uuid"; // Import UUID for generating unique file names

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryAdded: () => void; // Callback to refresh category list
}

const AddCategoryModal: React.FC<AddCategoryModalProps> = ({
  isOpen,
  onClose,
  onCategoryAdded,
}) => {
  const [categoryName, setCategoryName] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null); // For displaying the selected image
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file)); // Create a preview URL
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    let imageUrl: string | null = null;

    if (imageFile) {
      try {
        // Generate a unique file name
        const fileName = `${uuidv4()}-${imageFile.name}`;

        // Upload the image to Supabase Storage
        const { data: storageData, error: storageError } =
          await supabase.storage
            .from("category-images") // Replace with your bucket name!
            .upload(fileName, imageFile, {
              cacheControl: "3600",
              upsert: false,
            });

        if (storageError) {
          console.error("Error uploading image:", storageError);
          setError(storageError.message);
          setLoading(false);
          return;
        }

        // Get the public URL of the uploaded image
        imageUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/category-images/${fileName}`; // Construct the full URL
      } catch (uploadErr: any) {
        console.error("Error uploading image:", uploadErr);
        setError(
          uploadErr.message ||
            "An unexpected error occurred during image upload."
        );
        setLoading(false);
        return;
      }
    }

    try {
      // Insert the category data into the database
      const { data, error } = await supabase
        .from("category")
        .insert([{ category_name: categoryName, image: imageUrl }]);

      if (error) {
        console.error("Error adding category:", error);
        setError(error.message);
      } else {
        console.log("Category added successfully:", data);
        onCategoryAdded(); // Refresh the category list
        onClose(); // Close the modal
      }
    } catch (err: any) {
      console.error("Error adding category:", err);
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3 text-center">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Add New Category
          </h3>
          <div className="mt-2">
            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="categoryName"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Category Name:
                </label>
                <input
                  type="text"
                  id="categoryName"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="imageFile"
                  className="block text-gray-700 text-sm font-bold mb-2"
                >
                  Image (Optional):
                </label>
                <input
                  type="file"
                  id="imageFile"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  accept="image/*"
                  onChange={handleImageChange}
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Category Preview"
                    className="mt-2 w-24 h-24 object-cover rounded-full"
                  />
                )}
              </div>

              <div className="items-center px-4 py-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={loading}
                >
                  {loading ? "Adding..." : "Add Category"}
                </button>
                <button
                  className="px-4 py-2 bg-gray-200 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 mt-2"
                  onClick={onClose}
                  type="button"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryModal;
