const path = require("path");
const fs = require("fs");
const { matter } = require("md-front-matter");
const fg = require("fast-glob");

// Using the parsed front matter, create a structure value for each doc candidate
const build_structure_from_doc_data = (file_path, data) => {
  return {
    label: data.title,
    preview: {
      text: [data.title],
      subtext: [data.nav_section],
      tags: [data.nav_section], // Structures can have tags, which a user can filter for in CloudCannon
    },
    value: { file_path },
  };
};

// Find all relevant files on disk, and process them into an array of structures
const build_docs_structures = () => {
  return fg
    .sync([path.join(__dirname, "content/docs/**/*.md")])
    .map((doc_file) => {
      const file_content = fs.readFileSync(doc_file, {
        encoding: "utf8",
      });
      const rel_doc_file = doc_file.replace(__dirname, "");
      const { data } = matter(file_content);

      return build_structure_from_doc_data(rel_doc_file, data);
    });
};

module.exports = {
  collections_config: {
    pages: {
      output: true,
      parse_branch_index: true,
      disable_add_folder: true,
      path: "content",
      base_url: "/",
      icon: "feed",
      filter: {
        base: "strict",
      },
    },
    docs: {
      path: "content/docs",
      base_url: "/docs",
      icon: "file",
      parse_branch_index: true,
      output: true,
    },
  },
  _inputs: {
    file_path: {
      type: "disabled", // Structures will save as an object, so we will show the file path within it as a non-editable input
    },
  },
  _structures: {
    // Create the actual CloudCannon structure definition
    docs: {
      values: build_docs_structures(), // Use the generated structures from content
      id_key: "file_path", // Tell CloudCannon to use the file_path value to determine structure equality
      style: "modal", // Tell CloudCannon to use the modal picker for this structure
    },
  },
};
