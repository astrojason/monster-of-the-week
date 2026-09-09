import { describe, it, expect, vi } from "vitest";
import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlaybookOptionsFields } from "./PlaybookOptionsFields";
import type { PlaybookOptionSection, PlaybookOptionValues } from "@/lib/playbookOptions";

const fateSection: PlaybookOptionSection = {
  key: "fate",
  label: "Fate",
  kind: "fields",
  fields: [
    {
      key: "found-out",
      label: "How You Found Out",
      kind: "select",
      choices: ["Trained from birth", "Some weirdo told you"],
    },
    {
      key: "heroic",
      label: "Heroic tags",
      kind: "multiselect",
      pick: 2,
      choices: ["Sacrifice", "Visions", "True love"],
    },
    {
      key: "material",
      label: "Material",
      kind: "select",
      allowCustom: true,
      choices: ["Steel", "Silver"],
    },
    { key: "corruption", label: "Corruption", kind: "number", max: 7 },
    { key: "notes", label: "Notes", kind: "text", placeholder: "anything else" },
  ],
};

const crewSection: PlaybookOptionSection = {
  key: "crew",
  label: "Crew",
  kind: "repeatable",
  itemLabel: "Crew member",
  min: 0,
  max: 2,
  fields: [
    { key: "name", label: "Name", kind: "text" },
    { key: "job", label: "Job", kind: "select", choices: ["Fixer", "Wheelman"] },
  ],
};

describe("PlaybookOptionsFields", () => {
  it("renders nothing when the playbook has no sections", () => {
    const { container } = render(<PlaybookOptionsFields sections={[]} values={{}} onChange={vi.fn()} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("renders a select field and reports the chosen value", async () => {
    const onChange = vi.fn();
    render(<PlaybookOptionsFields sections={[fateSection]} values={{}} onChange={onChange} />);
    await userEvent.selectOptions(screen.getByLabelText("How You Found Out"), "Trained from birth");
    expect(onChange).toHaveBeenCalledWith({
      fate: { "found-out": ["Trained from birth"] },
    });
  });

  it("lets you check multiselect boxes up to the pick count and disables the rest", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <PlaybookOptionsFields sections={[fateSection]} values={{}} onChange={onChange} />
    );
    await userEvent.click(screen.getByRole("checkbox", { name: "Sacrifice" }));
    expect(onChange).toHaveBeenCalledWith({ fate: { heroic: ["Sacrifice"] } });

    rerender(
      <PlaybookOptionsFields
        sections={[fateSection]}
        values={{ fate: { heroic: ["Sacrifice", "Visions"] } }}
        onChange={onChange}
      />
    );
    expect(screen.getByRole("checkbox", { name: "True love" })).toBeDisabled();
  });

  it("reveals a text input for a custom write-in choice", async () => {
    function Controlled() {
      const [values, setValues] = useState<PlaybookOptionValues>({});
      return <PlaybookOptionsFields sections={[fateSection]} values={values} onChange={setValues} />;
    }
    render(<Controlled />);
    await userEvent.selectOptions(screen.getByLabelText("Material"), "Write in...");
    expect(screen.getByPlaceholderText(/write in material/i)).toBeInTheDocument();
    await userEvent.type(screen.getByPlaceholderText(/write in material/i), "Cold iron");
    expect(screen.getByPlaceholderText(/write in material/i)).toHaveValue("Cold iron");
  });

  it("renders number and text fields and reports changes", async () => {
    const onChange = vi.fn();
    render(<PlaybookOptionsFields sections={[fateSection]} values={{}} onChange={onChange} />);
    await userEvent.type(screen.getByLabelText("Corruption"), "3");
    expect(onChange).toHaveBeenCalledWith({ fate: { corruption: ["3"] } });

    await userEvent.type(screen.getByLabelText("Notes"), "x");
    expect(onChange).toHaveBeenCalledWith({ fate: { notes: ["x"] } });
  });

  it("adds and removes entries in a repeatable section", async () => {
    const onChange = vi.fn();
    const { rerender } = render(
      <PlaybookOptionsFields sections={[crewSection]} values={{}} onChange={onChange} />
    );
    await userEvent.click(screen.getByRole("button", { name: /add crew member/i }));
    expect(onChange).toHaveBeenCalledWith({ crew: [{}] });

    rerender(
      <PlaybookOptionsFields
        sections={[crewSection]}
        values={{ crew: [{ name: ["Sal"], job: ["Fixer"] }] }}
        onChange={onChange}
      />
    );
    expect(screen.getByDisplayValue("Sal")).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /remove crew member 1/i }));
    expect(onChange).toHaveBeenCalledWith({ crew: [] });
  });

  it("disables adding more entries once the repeatable max is reached", () => {
    render(
      <PlaybookOptionsFields
        sections={[crewSection]}
        values={{ crew: [{ name: ["Sal"] }, { name: ["Reg"] }] }}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByRole("button", { name: /add crew member/i })).toBeDisabled();
  });
});
