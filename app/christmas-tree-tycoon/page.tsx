"use client";

import clsx from "clsx";
import { atom, useAtom } from "jotai";
import React, { useEffect } from "react";

const startingMoney = 1000;
const treePlanCost = 5;
const treeGrowTime = 5;
const treeSellPrice = 20;
const tractorPrice = 500;

type Tractor = {
  fieldId: string;
  speed: 1;
};

type Tree = {
  id: string;
  fieldId: string;
  age: number; // age in days
  isReadyForSale: boolean;
};

type Field = {
  id: string;
};

// Atoms
const moneyAtom = atom(startingMoney);
const fieldsAtom = atom<Field[]>([{ id: crypto.randomUUID() }]);
const treesAtom = atom<Tree[]>([]);
const tractorsAtom = atom<Tractor[]>([]);

const playSound = (file: string, vol = 1) => {
  const sound = new Audio(file);
  sound.volume = vol;
  sound.play();
};

const playSoundWithRepeat = (file: string, times: number, delay: number) => {
  if (times > 0) {
    playSound(file);
    setTimeout(() => playSoundWithRepeat(file, times - 1, delay), delay);
  }
};

export default function Farm() {
  const [money, setMoney] = useAtom(moneyAtom);
  const [fields, setFields] = useAtom(fieldsAtom);
  const fieldCost = 1000; // Cost to buy a new field

  const [trees, setTrees] = useAtom(treesAtom);

  // Simulate tree growth
  useEffect(() => {
    const interval = setInterval(() => {
      setTrees((currentTrees) =>
        currentTrees.map((tree) => {
          if (tree.age < treeGrowTime) {
            // 5 days to ready for sale
            return { ...tree, age: tree.age + 1 };
          }
          return { ...tree, isReadyForSale: true };
        })
      );
    }, 1000); // Update every second for demo purposes

    return () => clearInterval(interval);
  }, [setTrees]);

  // Function to handle buying a new field
  const buyField = () => {
    if (money >= fieldCost) {
      setFields([...fields, { id: crypto.randomUUID() }]);
      setMoney(money - fieldCost);
    } else {
      alert("Not enough money to buy a new field!");
    }
  };

  return (
    <div>
      <div className="p-10">
        <div className="font-bold text-3xl">Christmas Tree Tycoon</div>
        <div className="">Money: ${money}</div>
        <div className="">Number of Fields: {fields.length}</div>
        <Button onClick={buyField} disabled={money < fieldCost}>
          Buy New Field (${fieldCost})
        </Button>
      </div>

      <div className="flex gap-10 p-10 flex-wrap">
        {fields.map((field) => (
          <Field key={field.id} field={field} />
        ))}
      </div>
    </div>
  );
}

export function Field({ field }: { field: Field }) {
  const [money, setMoney] = useAtom(moneyAtom);
  const [trees, setTrees] = useAtom(treesAtom);
  const [tractors, setTractors] = useAtom(tractorsAtom);

  // Plant a tree
  const plantTree = () => {
    playSound("/plant.m4a");
    const newTree: Tree = {
      id: crypto.randomUUID(),
      fieldId: field.id,
      age: 0,
      isReadyForSale: false,
    };
    setMoney(money - treePlanCost);
    setTrees([...trees, newTree]);
  };

  const plantMaxTress = () => {
    const newTrees: Tree[] = [];
    const treesInField = trees.filter((tree) => tree.fieldId === field.id);
    const treesWeCanAfford = Math.floor(money / treePlanCost);
    const treesWeCanPlant = Math.min(
      treesWeCanAfford,
      16 - treesInField.length
    );

    for (let i = 0; i < treesWeCanPlant; i++) {
      newTrees.push({
        id: crypto.randomUUID(),
        fieldId: field.id,
        age: 0,
        isReadyForSale: false,
      });
    }

    const playSoundWithDelay = (times: number, delay: number) => {
      if (times > 0) {
        playSound("/plant.m4a");
        setTimeout(() => playSoundWithDelay(times - 1, delay), delay);
      }
    };

    playSoundWithDelay(3, 30);

    setMoney(money - treePlanCost * newTrees.length);
    setTrees([...trees, ...newTrees]);
  };

  function harvestField() {
    const treesInField = trees.filter((tree) => tree.fieldId === field.id);
    const treesReadyForSale = treesInField.filter(
      (tree) => tree.isReadyForSale
    );
    const moneyFromHarvest = treesReadyForSale.length * treeSellPrice;

    playSoundWithRepeat("/kaching.mp3", 3, 100);
    setTrees(trees.filter((tree) => tree.fieldId !== field.id));
    setMoney(money + moneyFromHarvest);
  }

  // Sell a tree
  const sellTree = (treeId: string) => {
    playSound("/kaching.mp3");
    setTrees(trees.filter((tree) => tree.id !== treeId));
    setMoney(money + treeSellPrice); // Each tree sells for 10
  };

  function buyTractor() {
    const newTractor: Tractor = {
      fieldId: field.id,
      speed: 1,
    };
    setTractors([...tractors, newTractor]);
    setMoney(money - tractorPrice);
    playSound("/tractor.mp3");
  }

  const fieldTrees = trees.filter((tree) => tree.fieldId === field.id);
  const canPlant = money < treePlanCost || fieldTrees.length >= 16;
  const hasTractor = tractors.some((tractor) => tractor.fieldId === field.id);

  return (
    <div>
      <div className="rounded-xl p-4 bg-amber-900">
        <div className="w-[240px] h-[240px] ">
          <div className="flex flex-wrap">
            {fieldTrees.map((tree) => (
              <div
                key={tree.id}
                className="w-[60px] h-[60px] flex-none items-center"
              >
                <div
                  className="aspect-w-1 aspect-h-1 flex-none bg-green-500 rounded-full overflow-hidden"
                  style={{
                    width: 50,
                    height: 50,
                    transform: `scale(${(tree.age + 1) / (treeGrowTime + 1)})`,
                  }}
                  onClick={() => tree.isReadyForSale && sellTree(tree.id)}
                >
                  {tree.isReadyForSale && (
                    <div className="flex items-center justify-center w-full h-full bg-lime-500 cursor-pointer text-white">
                      ${treeSellPrice}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3">
        {!hasTractor && (
          <Button onClick={plantTree} disabled={canPlant}>
            Plant a Tree
          </Button>
        )}
        {hasTractor && (
          <div className="flex gap-2">
            <Button onClick={plantMaxTress} disabled={!money}>
              Plant Field
            </Button>
            <Button onClick={harvestField} disabled={!money}>
              Harvest Field
            </Button>
          </div>
        )}
      </div>
      {!hasTractor && (
        <div className="mt-3">
          <Button disabled={money < 500} onClick={buyTractor}>
            Buy Tractor ($500)
          </Button>
        </div>
      )}
    </div>
  );
}

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

function Button(props: ButtonProps) {
  const { className, ...rest } = props;
  return (
    <button
      {...rest}
      className={clsx(
        "px-4 py-3 rounded-xl",
        rest.disabled
          ? "bg-gray-500 opacity-50 cursor-not-allowed"
          : "bg-green-500  text-white"
      )}
    ></button>
  );
}
