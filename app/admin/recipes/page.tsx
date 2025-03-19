// pages/admin/recipes/page.tsx
"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabaseClient";
import Link from "next/link";
import Image from "next/image";
import AdminLayout from "../../components/DashboardHeader";
import AddCategoryModal from "../../components/AddCategoryModal";
import AddOccasionModal from "../../components/AddOccasionModal";

type Category = {
  category_id: string;
  category_name: string;
  image: string;
};

type Occasion = {
  occasion_id: string;
  name: string;
  image_occasions: string;
};

export default function RecipeManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [occasions, setOccasions] = useState<Occasion[]>([]);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showAddOccasionModal, setShowAddOccasionModal] = useState(false);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from("category").select();
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchOccasions = async () => {
    try {
      const { data, error } = await supabase.from("occasion").select();
      if (error) throw error;
      setOccasions(data || []);
    } catch (error) {
      console.error("Error fetching occasions:", error);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchOccasions();
  }, []);

  const handleCategoryAdded = () => {
    fetchCategories(); // Refresh categories after adding
  };

  const handleOccasionAdded = () => {
    fetchOccasions(); // Refresh occasions after adding
  };

  return (
    <AdminLayout>
      <main className="container mx-auto p-4 md:p-8">
        <div className="bg-gray-50 min-h-screen p-4 md:p-8">
          {/* Recipe Category Section */}
          <section className="mb-8 md:mb-12">
            <h2 className="text-2xl font-bold mb-4 md:mb-6">Recipe Category</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {categories.length > 0 ? (
                categories.map((category) => (
                  <div
                    key={category.category_id}
                    className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition duration-200 flex flex-col items-center justify-center"
                  >
                    <Image
                      src={category.image}
                      alt={category.category_name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
                    />
                    <h3 className="text-lg font-semibold text-center mb-2">
                      {category.category_name}
                    </h3>
                    <Link
                      href={`/recipes/category/${category.category_id}`}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg block mx-auto text-center hover:bg-orange-600 transition-colors duration-200"
                    >
                      View
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600 col-span-full">
                  No categories available.
                </p>
              )}
              {/* Add Category Button */}
              <div className="flex items-center justify-center bg-gray-100 p-4 rounded-lg border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors duration-200">
                <button
                  onClick={() => setShowAddCategoryModal(true)}
                  className="text-orange-500 text-lg font-medium hover:text-orange-600 transition-colors duration-200"
                >
                  + Add Category
                </button>
              </div>
            </div>
          </section>

          {/* Occasion Section */}
          <section className="mb-8 md:mb-12">
            <h2 className="text-2xl font-bold mb-4 md:mb-6">Occasion</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {occasions.length > 0 ? (
                occasions.map((occasion) => (
                  <div
                    key={occasion.occasion_id}
                    className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition duration-200 flex flex-col items-center justify-center"
                  >
                    <Image
                      src={occasion.image_occasions}
                      alt={occasion.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 rounded-full object-cover mx-auto mb-2"
                    />
                    <h3 className="text-lg font-semibold text-center mb-2">
                      {occasion.name}
                    </h3>
                    <Link
                      href={`/recipes/occasion/${occasion.occasion_id}`}
                      className="bg-orange-500 text-white px-4 py-2 rounded-lg block mx-auto text-center hover:bg-orange-600 transition-colors duration-200"
                    >
                      View
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-center text-gray-600 col-span-full">
                  No occasions available.
                </p>
              )}
              {/* Add Occasion Button */}
              <div className="flex items-center justify-center bg-gray-100 p-4 rounded-lg border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors duration-200">
                <button
                  onClick={() => setShowAddOccasionModal(true)}
                  className="text-orange-500 text-lg font-medium hover:text-orange-600 transition-colors duration-200"
                >
                  + Add Occasion
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onCategoryAdded={handleCategoryAdded}
      />
      <AddOccasionModal
        isOpen={showAddOccasionModal}
        onClose={() => setShowAddOccasionModal(false)}
        onOccasionAdded={handleOccasionAdded}
      />
    </AdminLayout>
  );
}
