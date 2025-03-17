"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link";
import {
  Session as SupabaseSessionBase,
  User as SupabaseUser,
} from "@supabase/supabase-js";

interface User {
  user_id: string;
  image_url?: string;
}

interface UserProfile {
  user_id: string;
  user_name: string;
  email: string;
  about_me: string;
  image_url?: string;
}

// Define a more precise type for the Supabase session
interface SupabaseSession extends SupabaseSessionBase {
  user: SupabaseUser; // The actual type from supabase-js
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [imageUrl, setImageUrl] = useState<string>("/default-avatar.png");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const { data, error: sessionError } = await supabase.auth.getSession(); // Rename data to avoid confusion

      if (sessionError) {
        console.error("❌ Error fetching session:", sessionError.message);
        setIsLoading(false);
        return;
      }

      const session = data.session as SupabaseSession | null; // Type assertion

      if (session?.user?.id) {
        setUser({ user_id: session.user.id });
      } else {
        console.log("🚨 No active session. Please log in.");
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (!user?.user_id) {
      console.log("🚨 No user ID found, skipping fetch.");
      setIsLoading(false);
      return;
    }

    console.log("🔄 Fetching profile for user:", user.user_id);

    const fetchUserData = async () => {
      try {
        const userData = await getUserById(user.user_id);
        console.log("🔍 User Data:", userData);

        if (userData) {
          setUserProfile(userData);
        }

        if (userData?.image_url) {
          const { data: signedUrlData, error: urlError } =
            await supabase.storage
              .from("image_url")
              .createSignedUrl(userData.image_url, 60);

          if (urlError) {
            console.error("❌ Error generating signed URL:", urlError.message);
            setImageUrl("/default-avatar.png");
          } else if (signedUrlData?.signedUrl) {
            setImageUrl(signedUrlData.signedUrl);
          }
        } else {
          console.log("⚠️ No Profile Image Found, Using Default");
          setImageUrl("/default-avatar.png");
        }
      } catch (error) {
        console.error("❌ Error Fetching User Data:", error);
        setImageUrl("/default-avatar.png");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user?.user_id]);

  return (
    <div>
      <nav className="shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-[110px]">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center">
                <img
                  src="/logo.png"
                  alt="CookBook Logo"
                  className="w-[50px] h-[50px] md:w-[70px] md:h-[70px] object-contain"
                />
              </Link>
            </div>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-10 text-lg">
              <Link
                href="/"
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                Home
              </Link>
              <Link
                href="/user/recipe"
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                Recipe
              </Link>
              <Link
                href="/user/about-us"
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                About Us
              </Link>
            </div>

            {/* Right Section (Search, Add Recipe, Profile) */}
            <div className="flex items-center space-x-20">
              {/* Search Bar */}
              <input
                type="text"
                className="border border-gray-500 rounded-full pl-4 pr-10 py-3 text-sm"
                placeholder="Search by name"
              />

              {/* Add Recipe Link */}
              <Link
                href={"/add-recipe"}
                className="text-lg font-medium text-blue-600 hover:text-blue-800"
              >
                + Add a Recipe
              </Link>

              {/* Profile Section */}
              <div className="flex items-center space-x-4">
                {isLoading ? (
                  <span>Loading...</span>
                ) : user ? (
                  <>
                    <Link
                      href="/profile/save-recipe"
                      className="hover:text-gray-700"
                    >
                      <span className="material-icons text-gray-600 w-5 h-5">
                        bookmark_border
                      </span>
                    </Link>
                    <Link href={`/profile/${user.user_id}`}>
                      <img
                        src={imageUrl || "/default-avatar.png"}
                        alt="Profile"
                        className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                      />
                    </Link>
                  </>
                ) : (
                  <Link
                    href="/login"
                    className="bg-blue-500 text-white px-4 py-2 rounded-full text-lg hover:bg-blue-600 transition"
                  >
                    Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Secondary Navigation */}
      <div className="text-lg">
        <ul className="space-x-10 ml-[180px] py-4">
          <Link
            href="/user/event"
            className="text-gray-600 hover:text-blue-600 font-medium"
          >
            Event
          </Link>
          <Link
            href="/user/popular"
            className="text-gray-600 hover:text-blue-600 font-medium"
          >
            Popular
          </Link>
          <Link
            href="/soup"
            className="text-gray-600 hover:text-blue-600 font-medium"
          >
            Soup
          </Link>
          <Link
            href="/stir-frieds"
            className="text-gray-600 hover:text-blue-600 font-medium"
          >
            Stir Frieds
          </Link>
          <Link
            href="/occasion"
            className="text-gray-600 hover:text-blue-600 font-medium"
          >
            Occasions
          </Link>
          <Link
            href="/drinks"
            className="text-gray-600 hover:text-blue-600 font-medium"
          >
            Drinks
          </Link>
          <Link
            href="/dessert"
            className="text-gray-600 hover:text-blue-600 font-medium"
          >
            Dessert
          </Link>
        </ul>
      </div>
    </div>
  );
}

// Function to fetch user data by user_id
export const getUserById = async (
  userId: string
): Promise<UserProfile | null> => {
  console.log("🔍 Fetching user data for ID:", userId);

  const { data, error } = await supabase
    .from("users")
    .select("user_id, user_name, email, about_me, image_url")
    .eq("user_id", userId)
    .single();

  if (error) {
    console.error("❌ Error fetching user:", error.message);
    return null;
  }

  if (!data) {
    console.log("⚠️ User not found for ID:", userId);
    return null;
  }

  if (data?.image_url) {
    try {
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from("image_url")
        .createSignedUrl(data.image_url, 60);

      if (urlError) {
        console.error("❌ Error generating signed URL:", urlError.message);
      } else if (signedUrlData?.signedUrl) {
        data.image_url = signedUrlData.signedUrl;
      }
    } catch (signedUrlError) {
      console.error("❌ Error generating signed URL:", signedUrlError);
    }
  }

  console.log("✅ User fetched:", data);
  return data as UserProfile;
};
