"use client";

import clsx from "clsx";
import { RocketIcon, StarIcon, TreePineIcon } from "lucide-react";
import Link from "next/link";
import React from "react";

export default function page() {
  return (
    <div className="h-screen flex justify-center items-center">
      <div className="">
        <div className="text-2xl font-black uppercase text-gray-500">
          Pick a game
        </div>
        <div className="mt-2">
          <Link href="cupcake-cabin">
            <Button leading={<StarIcon className="w-4" />}>
              Cupcake Cabin
            </Button>
          </Link>
        </div>
        <div className="mt-2">
          <Link href="blasters">
            <Button leading={<RocketIcon className="w-4" />}>Blasters</Button>
          </Link>
        </div>
        <div className="mt-2">
          <Link href="christmas-tree-tycoon">
            <Button leading={<TreePineIcon className="w-4" />}>
              Christmas Tree Tycoon
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  leading?: React.ReactNode;
};

function Button(props: ButtonProps) {
  const { className, children, leading, ...rest } = props;
  return (
    <button
      {...rest}
      className={clsx(
        "px-4 py-3 rounded-xl hover:-translate-y-[2px] transition-all duration-200 flex gap-2",
        rest.disabled
          ? "bg-gray-500 opacity-50 cursor-not-allowed"
          : "bg-gradient-to-b from-green-500 to-green-400 border-2 border-green-500 rounded-xl font-bold text-white cursor-pointer"
      )}
    >
      {leading && <div className="">{leading}</div>}
      <div className="">{children}</div>
    </button>
  );
}
