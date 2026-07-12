"use client";

import type { DragEvent } from "react";
import EngineCircuit from "./EngineCircuit";
import EngineCore from "./EngineCore";
import type { EngineStatus } from "./EngineCore";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

type InputCategory = "Business" | "Product" | "Technology";

type EngineInput = {
  id: string;
  label: string;
  category: InputCategory;
  outputs: string[];
};

const engineInputs: EngineInput[] = [
  {
    id: "business-goals",
    label: "Business Goals",
    category: "Business",
    outputs: ["Product Strategy", "Success Metrics"],
  },
  {
    id: "customer-needs",
    label: "Customer Needs",
    category: "Business",
    outputs: ["User Research", "Customer Journey"],
  },
  {
    id: "team-alignment",
    label: "Team Alignment",
    category: "Business",
    outputs: ["Product Roadmap", "Delivery Plan"],
  },
  {
    id: "budget",
    label: "Budget",
    category: "Business",
    outputs: ["MVP Scope", "Prioritised Roadmap"],
  },
  {
    id: "existing-product",
    label: "Existing Product",
    category: "Product",
    outputs: ["Product Audit", "Improvement Roadmap"],
  },
  {
    id: "new-product",
    label: "New Product",
    category: "Product",
    outputs: ["Product Definition", "MVP Roadmap"],
  },
  {
    id: "service",
    label: "Service",
    category: "Product",
    outputs: ["Service Blueprint", "Experience Strategy"],
  },
  {
    id: "mobile-app",
    label: "Mobile App",
    category: "Product",
    outputs: ["UX/UI Design", "Mobile Product Architecture"],
  },
  {
    id: "web-platform",
    label: "Web Platform",
    category: "Product",
    outputs: ["UX Architecture", "Design System"],
  },
  {
    id: "ai",
    label: "AI",
    category: "Technology",
    outputs: ["AI Opportunity Assessment", "AI Experience Design"],
  },
  {
    id: "data",
    label: "Data",
    category: "Technology",
    outputs: ["Analytics Strategy", "Measurement Framework"],
  },
  {
    id: "legacy-systems",
    label: "Legacy Systems",
    category: "Technology",
    outputs: ["Modernisation Roadmap", "Migration Strategy"],
  },
  {
    id: "integrations",
    label: "Integrations",
    category: "Technology",
    outputs: ["Technical Architecture", "Integration Plan"],
  },
  {
    id: "automation",
    label: "Automation",
    category: "Technology",
    outputs: ["Workflow Design", "Automation Strategy"],
  },
];

const categories: InputCategory[] = [
  "Business",
  "Product",
  "Technology",
];

const outputDescriptions: Record<string, string> = {
  "Product Strategy":
    "Defines the product direction, priorities and measurable business outcomes.",

  "Success Metrics":
    "Establishes how product performance and business value will be measured.",

  "User Research":
    "Identifies real customer behaviours, needs and decision-making patterns.",

  "Customer Journey":
    "Maps the complete customer experience across channels and touchpoints.",

  "Product Roadmap":
    "Creates a phased plan connecting product priorities with delivery.",

  "Delivery Plan":
    "Defines roles, dependencies, milestones and practical next steps.",

  "MVP Scope":
    "Identifies the smallest valuable product that can be tested and launched.",

  "Prioritised Roadmap":
    "Balances user value, business impact, effort and available investment.",

  "Product Audit":
    "Reviews the existing product experience, workflows and performance.",

  "Improvement Roadmap":
    "Prioritises the most valuable product and service improvements.",

  "Product Definition":
    "Clarifies the product proposition, audience, features and success criteria.",

  "MVP Roadmap":
    "Turns the product concept into a focused and achievable delivery plan.",

  "Service Blueprint":
    "Connects customer actions with people, processes and supporting systems.",

  "Experience Strategy":
    "Defines the experience principles and priorities across the service.",

  "UX/UI Design":
    "Creates intuitive workflows and production-ready interface designs.",

  "Mobile Product Architecture":
    "Structures the mobile experience, navigation and core functionality.",

  "UX Architecture":
    "Organises complex content and workflows into a usable digital experience.",

  "Design System":
    "Creates reusable patterns and components for consistent product delivery.",

  "AI Opportunity Assessment":
    "Identifies useful AI applications based on genuine customer and business needs.",

  "AI Experience Design":
    "Designs understandable and responsible interactions with AI-powered features.",

  "Analytics Strategy":
    "Defines the data required to understand behaviour and improve performance.",

  "Measurement Framework":
    "Connects product activity with clear business and customer outcomes.",

  "Modernisation Roadmap":
    "Creates a practical path from legacy systems to a modern product experience.",

  "Migration Strategy":
    "Plans the safe transition of users, workflows and data into the new system.",

  "Technical Architecture":
    "Defines how systems, services and external platforms should connect.",

  "Integration Plan":
    "Prioritises integrations and defines how information moves between systems.",

  "Workflow Design":
    "Simplifies operational tasks and removes unnecessary manual steps.",

  "Automation Strategy":
    "Identifies where automation can reduce effort and improve service delivery.",
};

function calculateScore(selected: EngineInput[]) {
  if (selected.length === 0) {
    return 0;
  }

  const inputScore = Math.min(selected.length, 6) * 10;

  const categoryCount = new Set(
    selected.map((item) => item.category),
  ).size;

  const categoryScore = categoryCount * 12;

  const hasBusiness = selected.some(
    (item) => item.category === "Business",
  );

  const hasProduct = selected.some(
    (item) => item.category === "Product",
  );

  const hasTechnology = selected.some(
    (item) => item.category === "Technology",
  );

  const balanceBonus =
    hasBusiness && hasProduct && hasTechnology
      ? 24
      : hasBusiness && hasProduct
        ? 12
        : 0;

  return Math.min(
    inputScore + categoryScore + balanceBonus,
    100,
  );
}

function getHint(selected: EngineInput[]) {
  if (selected.length === 0) {
    return "Start with a business goal or customer need.";
  }

  if (
    !selected.some(
      (item) => item.id === "customer-needs",
    )
  ) {
    return "Strong products usually include Customer Needs.";
  }

  if (
    !selected.some(
      (item) => item.category === "Product",
    )
  ) {
    return "Add the product or service you want to create or improve.";
  }

  if (
    !selected.some(
      (item) => item.category === "Technology",
    )
  ) {
    return "Technology is optional, but it can strengthen the solution.";
  }

  if (selected.length < 3) {
    return "Add one more ingredient to activate the engine.";
  }

  if (selected.length < 6) {
    return "The engine is ready. Add more inputs or build now.";
  }

  return "Maximum inputs reached. Your solution is ready to build.";
}

export default function EngineSection() {
  const [selectedIds, setSelectedIds] = useState<string[]>(
    [],
  );

  const [isDraggingOver, setIsDraggingOver] =
    useState(false);

  const [isBuilding, setIsBuilding] = useState(false);

  const [hasBuilt, setHasBuilt] = useState(false);

  const [activeOutput, setActiveOutput] = useState<
  string | null
>(null);

const [isAccepting, setIsAccepting] = useState(false);

const [acceptedLabel, setAcceptedLabel] = useState<
  string | undefined
>(undefined);

const acceptedTimerRef = useRef<
  ReturnType<typeof setTimeout> | null
>(null);

useEffect(() => {
  return () => {
    if (acceptedTimerRef.current) {
      clearTimeout(acceptedTimerRef.current);
    }
  };
}, []);

  const selectedInputs = useMemo(
    () =>
      selectedIds
        .map((id) =>
          engineInputs.find((item) => item.id === id),
        )
        .filter(
          (item): item is EngineInput => Boolean(item),
        ),
    [selectedIds],
  );

  const generatedOutputs = useMemo(() => {
    const outputSet = new Set<string>();

    selectedInputs.forEach((input) => {
      input.outputs.forEach((output) => {
        outputSet.add(output);
      });
    });

    return Array.from(outputSet).slice(0, 6);
  }, [selectedInputs]);

  const score = calculateScore(selectedInputs);

  const canBuild =
    selectedInputs.length >= 3 && !isBuilding;

const latestInput =
  selectedInputs[selectedInputs.length - 1];

const engineStatus: EngineStatus = isBuilding
  ? "building"
  : hasBuilt
    ? "complete"
    : isDraggingOver
      ? "dragging"
      : isAccepting
        ? "accepted"
        : selectedInputs.length >= 3
          ? "ready"
          : selectedInputs.length > 0
            ? "configured"
            : "idle";

  const addInput = (id: string) => {
  if (
    selectedIds.includes(id) ||
    selectedIds.length >= 6
  ) {
    return;
  }

  const acceptedInput = engineInputs.find(
    (item) => item.id === id,
  );

  setHasBuilt(false);
  setActiveOutput(null);
  setSelectedIds((current) => [...current, id]);

  setAcceptedLabel(
    acceptedInput?.label ?? "Project ingredient",
  );

  setIsAccepting(true);

  if (acceptedTimerRef.current) {
    clearTimeout(acceptedTimerRef.current);
  }

  acceptedTimerRef.current = setTimeout(() => {
    setIsAccepting(false);
  }, 800);

  };

  const removeInput = (id: string) => {
    setHasBuilt(false);
    setActiveOutput(null);

    setSelectedIds((current) =>
      current.filter((item) => item !== id),
    );
  };

  const handleDragStart = (
    event: DragEvent<HTMLButtonElement>,
    inputId: string,
  ) => {
    event.dataTransfer.setData(
      "text/plain",
      inputId,
    );

    event.dataTransfer.effectAllowed = "copy";
  };

  const handleDrop = (
    event: DragEvent<HTMLDivElement>,
  ) => {
    event.preventDefault();

    const inputId =
      event.dataTransfer.getData("text/plain");

    if (inputId) {
      addInput(inputId);
    }

    setIsDraggingOver(false);
  };

  const buildSolution = () => {
    if (!canBuild) {
      return;
    }

    if (acceptedTimerRef.current) {
  clearTimeout(acceptedTimerRef.current);
}

setIsAccepting(false);

    setIsBuilding(true);
    setHasBuilt(false);
    setActiveOutput(null);

    window.setTimeout(() => {
      setIsBuilding(false);
      setHasBuilt(true);
    }, 1200);
  };

  const resetEngine = () => {
    setSelectedIds([]);
    setHasBuilt(false);
    setIsBuilding(false);
    setIsDraggingOver(false);
    setActiveOutput(null);
    if (acceptedTimerRef.current) {
    clearTimeout(acceptedTimerRef.current);}
    acceptedTimerRef.current = null;
    setIsAccepting(false);
    setAcceptedLabel(undefined);
  };

  return (
    <section
      id="process"
      className="bg-[#F8F9FB] py-24"
    >
      <div className="mx-auto max-w-[1500px] px-8">
        {/* Header */}

        <div className="mx-auto max-w-3xl text-center">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#FE5E04]">
            THE ELESSEN ENGINE™
          </p>

          <h2 className="mt-5 text-5xl font-bold tracking-tight text-[#4E5964]">
            Build your product.
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-xl leading-9 text-[#4E5964]/70">
            Drag project ingredients into the engine to
            see how product design, service design and
            development come together.
          </p>
        </div>

        {/* Interactive experience */}

        <div className="mt-16 grid items-stretch gap-8 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
          {/* Input library */}

          <aside className="h-full rounded-3xl border border-[#E4E9EF] bg-white p-7 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FE5E04]">
                  Ingredients
                </p>

                <h3 className="mt-2 text-2xl font-bold text-[#4E5964]">
                  Choose your inputs
                </h3>
              </div>

              <span className="rounded-full bg-[#F2F4F7] px-3 py-1 text-xs font-bold text-[#4E5964]/65">
                {selectedInputs.length}/6
              </span>
            </div>

            <div className="mt-7 space-y-7">
              {categories.map((category) => (
                <div key={category}>
                  <p className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-[#4E5964]/45">
                    {category}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    {engineInputs
                      .filter(
                        (item) =>
                          item.category === category,
                      )
                      .map((input) => {
                        const isSelected =
                          selectedIds.includes(input.id);

                        const isDisabled =
                          !isSelected &&
                          selectedIds.length >= 6;

                        return (
                          <button
                            key={input.id}
                            type="button"
                            draggable={
                              !isSelected && !isDisabled
                            }
                            disabled={
                              isSelected || isDisabled
                            }
                            onDragStart={(event) =>
                              handleDragStart(
                                event,
                                input.id,
                              )
                            }
                            onClick={() =>
                              addInput(input.id)
                            }
                            className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                              isSelected
                                ? "cursor-default border-[#FE5E04]/25 bg-[#FE5E04]/10 text-[#FE5E04]"
                                : isDisabled
                                  ? "cursor-not-allowed border-[#E3E7EC] bg-[#F6F7F9] text-[#4E5964]/30"
                                  : "cursor-grab border-[#DDE3E9] bg-white text-[#4E5964] hover:-translate-y-0.5 hover:border-[#FE5E04] hover:text-[#FE5E04] active:cursor-grabbing"
                            }`}
                          >
                            {isSelected ? "✓ " : ""}
                            {input.label}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl bg-[#FFF5EF] p-4">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#FE5E04]">
                Hint
              </p>

              <p className="mt-2 text-sm leading-6 text-[#4E5964]/70">
                {getHint(selectedInputs)}
              </p>
            </div>
          </aside>

          {/* Centre processor panel */}

          <div
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = "copy";
              setIsDraggingOver(true);
            }}
            onDragLeave={(event) => {
              if (
                event.currentTarget.contains(
                  event.relatedTarget as Node,
                )
              ) {
                return;
              }

              setIsDraggingOver(false);
            }}
            onDrop={handleDrop}
            className={`flex min-h-[620px] flex-col rounded-[36px] border bg-white p-7 transition-all duration-300 ${
              isDraggingOver
                ? "border-[#FE5E04] shadow-[0_0_50px_rgba(254,94,4,0.18)]"
                : "border-[#E4E9EF] shadow-sm"
            }`}
          >
            {/* Score and reset */}

            <div className="flex items-start justify-between gap-6">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#4E5964]/45">
                  Engine confidence
                </p>

                <div className="mt-1 flex items-end gap-2">
                  <span className="text-3xl font-bold text-[#4E5964]">
                    {score}
                  </span>

                  <span className="pb-1 text-sm font-semibold text-[#4E5964]/45">
                    /100
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={resetEngine}
                disabled={selectedInputs.length === 0}
                className="text-sm font-semibold text-[#4E5964]/50 transition hover:text-[#FE5E04] disabled:cursor-not-allowed disabled:opacity-30"
              >
                Reset
              </button>
            </div>

            {/* Selected ingredients */}

            <div className="mt-4 w-full border-y border-[#E8ECF1] py-4">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-[#4E5964]/45">
                Selected ingredients
              </p>

              <div className="flex min-h-8 flex-wrap gap-2">
                {selectedInputs.length === 0 && (
                  <span className="text-sm text-[#4E5964]/35">
                    Drag or select ingredients to begin.
                  </span>
                )}

                {selectedInputs.map((input) => (
                  <button
                    key={input.id}
                    type="button"
                    onClick={() =>
                      removeInput(input.id)
                    }
                    title={`Remove ${input.label}`}
                    className="rounded-full border border-[#FE5E04]/25 bg-[#FE5E04]/10 px-3 py-1.5 text-xs font-semibold text-[#FE5E04] transition hover:border-[#FE5E04]"
                  >
                    {input.label} ×
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive circuitry and processor */}

            <div className="relative mt-4 aspect-[12/7] w-full flex-1">
              <EngineCircuit />

              <div className="absolute left-1/2 top-1/2 z-20 w-[58%] max-w-[500px] -translate-x-1/2 -translate-y-1/2">
                <EngineCore
  status={engineStatus}
  title={
    hasBuilt
      ? `${generatedOutputs.length} outputs ready`
      : isAccepting
        ? acceptedLabel
        : selectedInputs.length > 0
          ? `${selectedInputs.length} ${
              selectedInputs.length === 1
                ? "input"
                : "inputs"
            } loaded`
          : latestInput?.label
  }
  message={
    hasBuilt
      ? "Open an output to learn more."
      : selectedInputs.length >= 3
        ? "Ready to build your solution."
        : selectedInputs.length > 0
          ? `${3 - selectedInputs.length} more ${
              3 - selectedInputs.length === 1
                ? "input"
                : "inputs"
            } needed`
          : undefined
  }
  score={score}
/>
              </div>
            </div>

            {/* Build control */}

            <div className="mt-4 flex items-center justify-between gap-5 border-t border-[#E8ECF1] pt-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FE5E04]">
                  {isBuilding
                    ? "Analysing"
                    : hasBuilt
                      ? "Solution ready"
                      : selectedInputs.length >= 3
                        ? "Engine ready"
                        : "Add at least 3 inputs"}
                </p>

                <p className="mt-1 text-sm text-[#4E5964]/50">
                  {hasBuilt
                    ? `${generatedOutputs.length} outputs generated`
                    : `${selectedInputs.length} of 6 ingredients selected`}
                </p>
              </div>

              <button
                type="button"
                onClick={buildSolution}
                disabled={!canBuild}
                className={`shrink-0 rounded-xl px-7 py-3.5 font-bold transition-all duration-300 ${
                  canBuild
                    ? "bg-[#FE5E04] text-white shadow-[0_12px_30px_rgba(254,94,4,0.22)] hover:-translate-y-0.5 hover:bg-[#E95404]"
                    : "cursor-not-allowed bg-[#E6E9ED] text-[#4E5964]/35"
                }`}
              >
                {isBuilding
                  ? "Building..."
                  : hasBuilt
                    ? "Build Again"
                    : "Build Solution"}
              </button>
            </div>
          </div>

          {/* Generated outputs */}

          <aside className="h-full rounded-3xl border border-[#E4E9EF] bg-white p-7 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#FE5E04]">
              Recommended outputs
            </p>

            <h3 className="mt-2 text-2xl font-bold text-[#4E5964]">
              Your solution
            </h3>

            {!hasBuilt && (
              <div className="mt-8 rounded-2xl border border-dashed border-[#DCE2E8] p-6 text-center">
                <p className="text-sm leading-6 text-[#4E5964]/50">
                  Your recommended product and service
                  design outputs will appear here.
                </p>
              </div>
            )}

            {hasBuilt && (
              <div className="mt-7 space-y-3">
                {generatedOutputs.map(
                  (output, index) => (
                    <button
                      key={output}
                      type="button"
                      onClick={() =>
                        setActiveOutput((current) =>
                          current === output
                            ? null
                            : output,
                        )
                      }
                      className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 ${
                        activeOutput === output
                          ? "border-[#FE5E04] bg-[#FFF5EF]"
                          : "border-[#E4E9EF] bg-[#FAFBFC] hover:border-[#FE5E04]/50"
                      }`}
                      style={{
                        transitionDelay: `${index * 60}ms`,
                      }}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className="font-semibold text-[#4E5964]">
                          {output}
                        </span>

                        <span className="text-[#FE5E04]">
                          {activeOutput === output
                            ? "−"
                            : "+"}
                        </span>
                      </div>

                      {activeOutput === output && (
                        <p className="mt-3 text-sm leading-6 text-[#4E5964]/65">
                          {
                            outputDescriptions[
                              output
                            ]
                          }
                        </p>
                      )}
                    </button>
                  ),
                )}
              </div>
            )}

            {hasBuilt && (
              <div className="mt-8 rounded-2xl bg-[#11161C] p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#FE5E04]">
                  Ready to build it?
                </p>

                <p className="mt-3 text-sm leading-6 text-white/65">
                  Book a discovery session and turn this
                  starting point into a real product plan.
                </p>

                <a
                  href="#contact"
                  className="mt-5 inline-flex rounded-xl bg-[#4E5964] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#E95404]"
                >
                  Book a discovery call
                </a>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}