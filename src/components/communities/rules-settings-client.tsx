"use client";

import { useTransition, useState } from "react";
import { ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addRuleAction, reorderRulesAction } from "@/actions/communities";

type Rule = {
  id: string;
  title: string;
  description: string | null;
  displayOrder: number;
};

type RulesSettingsClientProps = {
  community: { id: string; name: string };
  rules: Rule[];
};

export function RulesSettingsClient({ community, rules: initialRules }: RulesSettingsClientProps) {
  const [rules, setRules] = useState<Rule[]>(initialRules);
  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [addMessage, setAddMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [isAddPending, startAddTransition] = useTransition();
  const [isReorderPending, startReorderTransition] = useTransition();

  function handleAddRule(e: React.FormEvent) {
    e.preventDefault();
    setAddMessage(null);

    const formData = new FormData();
    formData.set("communityId", community.id);
    formData.set("communityName", community.name);
    formData.set("title", newTitle);
    formData.set("description", newDescription);

    startAddTransition(async () => {
      const result = await addRuleAction(formData);
      if (result.error) {
        setAddMessage({ type: "error", text: result.error });
        return;
      }
      setAddMessage({ type: "success", text: result.success ?? "Rule added." });
      setNewTitle("");
      setNewDescription("");
    });
  }

  function moveRule(index: number, direction: "up" | "down") {
    const swap = direction === "up" ? index - 1 : index + 1;
    if (swap < 0 || swap >= rules.length) return;

    const newRules = [...rules];
    [newRules[index], newRules[swap]] = [newRules[swap], newRules[index]];
    setRules(newRules);

    startReorderTransition(async () => {
      const result = await reorderRulesAction(
        newRules.map((r) => r.id),
        community.id,
        community.name
      );
      if (result.error) {
        // revert on failure
        setRules(rules);
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="text-xl font-semibold mb-1">Manage Rules</h1>
        <p className="text-sm text-muted-foreground mb-8">c/{community.name}</p>

        {/* Add Rule form */}
        <section className="mb-8">
          <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide text-muted-foreground">
            Add a Rule
          </h2>
          <form onSubmit={handleAddRule} className="flex flex-col gap-4 rounded-xl border border-border p-5">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="rule-title">Title <span className="text-destructive">*</span></Label>
              <Input
                id="rule-title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value.slice(0, 100))}
                placeholder="e.g. Be respectful"
                disabled={isAddPending}
                required
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="rule-description">
                  Description <span className="text-muted-foreground">(optional)</span>
                </Label>
                <span className="text-xs text-muted-foreground">{newDescription.length}/500</span>
              </div>
              <textarea
                id="rule-description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value.slice(0, 500))}
                placeholder="Elaborate on the rule…"
                disabled={isAddPending}
                rows={2}
                className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:opacity-50 resize-none"
              />
            </div>

            {addMessage && (
              <p className={`text-sm ${addMessage.type === "error" ? "text-destructive" : "text-green-600 dark:text-green-400"}`}>
                {addMessage.text}
              </p>
            )}

            <Button type="submit" disabled={isAddPending || !newTitle.trim()} className="self-start">
              {isAddPending ? "Adding…" : "Add Rule"}
            </Button>
          </form>
        </section>

        {/* Existing rules */}
        {rules.length > 0 && (
          <section>
            <h2 className="text-sm font-semibold mb-4 uppercase tracking-wide text-muted-foreground">
              Current Rules
            </h2>
            <div className="rounded-xl border border-border divide-y divide-border">
              {rules.map((rule, index) => (
                <div key={rule.id} className="flex items-start gap-3 px-4 py-3">
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveRule(index, "up")}
                      disabled={index === 0 || isReorderPending}
                      aria-label="Move rule up"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => moveRule(index, "down")}
                      disabled={index === rules.length - 1 || isReorderPending}
                      aria-label="Move rule down"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {index + 1}. {rule.title}
                    </p>
                    {rule.description && (
                      <p className="mt-0.5 text-xs text-muted-foreground">{rule.description}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
    </div>
  );
}
