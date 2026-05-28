"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Box, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateCollection } from "@/lib/query/hooks/collections";

const schema = z.object({
  name: z.string().min(1, "Collection name is required").regex(/^[a-z_]+$/, "Only lowercase letters and underscores"),
  singleton: z.boolean().default(false),
  primaryKey: z.string().default("id"),
  pkType: z.enum(["auto-increment", "uuid", "string"]).default("auto-increment"),
  status: z.boolean().default(false),
  sort: z.boolean().default(false),
  dateCreated: z.boolean().default(false),
  userCreated: z.boolean().default(false),
  dateUpdated: z.boolean().default(false),
  userUpdated: z.boolean().default(false),
});

type FormData = z.infer<typeof schema>;

const tabs = [
  { id: "setup", label: "Collection Setup" },
  { id: "optional", label: "Optional Field" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function CreateCollectionForm({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const createMutation = useCreateCollection();
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("setup");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      name: "",
      singleton: false,
      primaryKey: "id",
      pkType: "auto-increment",
      status: false,
      sort: false,
      dateCreated: false,
      userCreated: false,
      dateUpdated: false,
      userUpdated: false,
    },
  });

  const pkType = watch("pkType");

  const onSubmit = async (data: FormData) => {
    console.log("Create Collection — submitted data:", data);
    setSubmitting(true);
    try {
      await createMutation.mutateAsync({
        collection: data.name,
        meta: {
          primaryKey: data.primaryKey,
          pkType: data.pkType,
        },
        schema: {
          status: data.status,
          sort: data.sort,
          dateCreated: data.dateCreated,
          userCreated: data.userCreated,
          dateUpdated: data.dateUpdated,
          userUpdated: data.userUpdated,
        },
      });
      onSuccess();
    } catch {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div className="absolute left-0 top-[12px] -translate-x-[calc(100%+12px)] z-10 max-sm:hidden">
        <button
          type="button"
          onClick={onClose}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-[#E5E7EB] text-[#6B7280] transition-colors hover:bg-[#F9FAFB] hover:text-[#111827]"
          aria-label="Close drawer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 min-h-0">
        <nav className="w-[198px] shrink-0 bg-[#f0f4f9] border-r border-[#E5E7EB] flex flex-col p-[10px]">
          <div className="flex flex-col gap-1">
            {tabs.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveTab(id)}
                className={`flex h-[32px] w-full items-center rounded-md px-3 text-[13px] font-semibold transition-colors ${
                  activeTab === id
                    ? "bg-[#E4EAF1] text-black"
                    : "text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#111827]"
                }`}
              >
                <span className="truncate">{label}</span>
              </button>
            ))}
          </div>
        </nav>

        <div className="flex flex-1 flex-col min-w-0">
          <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex sm:hidden h-8 w-8 items-center justify-center rounded-full text-[#6B7280] transition-colors hover:bg-[#F9FAFB] hover:text-[#111827]"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
              <Box className="h-5 w-5 text-[#475569]" />
              <h2 className="text-[16px] font-bold leading-tight text-[#1E293B]">
                Creating New Collection
              </h2>
            </div>
            <button
              type="submit"
              disabled={!isValid || submitting}
              form="create-collection-form"
              className="flex h-[32px] w-[32px] items-center justify-center rounded-full bg-primary text-white transition-colors hover:bg-[#e04342] disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
            </button>
          </div>

          <form id="create-collection-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-1 flex-col">
            <div className="flex-1 overflow-y-auto px-6 py-6">
              {activeTab === "setup" && (
                <div className="space-y-5">
                  <div className="flex items-start gap-3 rounded-md border border-[#dbeafe] bg-[#eff6ff] px-4 py-3">
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-[#3b82f6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
                    </svg>
                    <p className="text-sm text-[#1e40af]">
                      Name the collection and setup its unique &ldquo;key&rdquo; field.
                    </p>
                  </div>

                  <div className="grid max-[770px]:grid-cols-1 grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="col-name" className="mb-1.5 block text-sm font-medium text-[#111827]">
                        Name <span className="text-primary">*</span>
                      </label>
                      <Input
                        id="col-name"
                        {...register("name")}
                        placeholder="A unique table name..."
                        className={errors.name ? "border-red-500" : ""}
                      />
                      {errors.name ? (
                        <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
                      ) : (
                        <p className="mt-1 text-xs text-[#9CA3AF]">
                          Collection names are case sensitive
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="col-singleton" className="mb-1.5 block text-sm font-medium text-[#111827]">
                        Singleton
                      </label>
                      <label htmlFor="col-singleton" className="flex h-[54px] cursor-pointer items-center rounded-md border-2 border-[#E5E7EB] bg-white px-3 focus-within:border-primary">
                        <input
                          type="checkbox"
                          id="col-singleton"
                          {...register("singleton")}
                          className="h-4 w-4 rounded border-[#E5E7EB] text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-[#6B7280]">Treat as single object</span>
                      </label>
                    </div>

                    <div>
                      <label htmlFor="col-pk" className="mb-1.5 block text-sm font-medium text-[#111827]">
                        Primary Key Field
                      </label>
                      <Input id="col-pk" {...register("primaryKey")} placeholder="id" />
                    </div>

                    <div>
                      <label htmlFor="col-pk-type" className="mb-1.5 block text-sm font-medium text-[#111827]">
                        Type
                      </label>
                      <Select
                        value={pkType}
                        onValueChange={(v) => setValue("pkType", v as FormData["pkType"])}
                      >
                        <SelectTrigger id="col-pk-type" className="h-[54px] border-2 border-[#E5E7EB] bg-white text-sm">
                          <SelectValue placeholder="Select key type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="auto-increment">Auto Increment</SelectItem>
                          <SelectItem value="uuid">UUID</SelectItem>
                          <SelectItem value="string">String</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "optional" && (
                <div className="space-y-5">
                  <p className="text-sm text-[#6B7280]">
                    Configure system fields for your collection.
                  </p>

                  <div className="grid max-[770px]:grid-cols-1 grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#111827]">Status</label>
                      <label className="flex h-[54px] cursor-pointer items-center rounded-md border-2 border-[#E5E7EB] bg-white px-3 focus-within:border-primary">
                        <input
                          type="checkbox"
                          {...register("status")}
                          className="h-4 w-4 rounded border-[#E5E7EB] text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-[#6B7280]">status</span>
                      </label>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#111827]">Sort</label>
                      <label className="flex h-[54px] cursor-pointer items-center rounded-md border-2 border-[#E5E7EB] bg-white px-3 focus-within:border-primary">
                        <input
                          type="checkbox"
                          {...register("sort")}
                          className="h-4 w-4 rounded border-[#E5E7EB] text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-[#6B7280]">sort</span>
                      </label>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#111827]">Created On</label>
                      <label className="flex h-[54px] cursor-pointer items-center rounded-md border-2 border-[#E5E7EB] bg-white px-3 focus-within:border-primary">
                        <input
                          type="checkbox"
                          {...register("dateCreated")}
                          className="h-4 w-4 rounded border-[#E5E7EB] text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-[#6B7280]">created_at</span>
                      </label>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#111827]">Created By</label>
                      <label className="flex h-[54px] cursor-pointer items-center rounded-md border-2 border-[#E5E7EB] bg-white px-3 focus-within:border-primary">
                        <input
                          type="checkbox"
                          {...register("userCreated")}
                          className="h-4 w-4 rounded border-[#E5E7EB] text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-[#6B7280]">created_by</span>
                      </label>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#111827]">Updated On</label>
                      <label className="flex h-[54px] cursor-pointer items-center rounded-md border-2 border-[#E5E7EB] bg-white px-3 focus-within:border-primary">
                        <input
                          type="checkbox"
                          {...register("dateUpdated")}
                          className="h-4 w-4 rounded border-[#E5E7EB] text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-[#6B7280]">updated_at</span>
                      </label>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-[#111827]">Updated By</label>
                      <label className="flex h-[54px] cursor-pointer items-center rounded-md border-2 border-[#E5E7EB] bg-white px-3 focus-within:border-primary">
                        <input
                          type="checkbox"
                          {...register("userUpdated")}
                          className="h-4 w-4 rounded border-[#E5E7EB] text-primary focus:ring-primary"
                        />
                        <span className="ml-2 text-sm text-[#6B7280]">updated_by</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
