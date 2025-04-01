import { Autocomplete, TextField } from '@mui/material';

const modules = [
  { label: 'MongoDB Basics', value: 'basics' },
  { label: 'MongoDB Atlas', value: 'atlas' },
  { label: 'Aggregation Framework', value: 'aggregation' },
  { label: 'Data Modeling', value: 'data_modeling' },
  { label: 'Indexing & Performance', value: 'indexing' },
  { label: 'Atlas Search', value: 'atlas_search' },
  { label: 'Atlas Vector Search', value: 'vector_search' },
  { label: 'Schema Design', value: 'schema_design' },
  { label: 'Realm/App Services', value: 'realm' }
];

export default function ModuleSelect({ value, onChange }) {
  return (
    <Autocomplete
      sx={{ width: 250 }}
      options={modules}
      value={value}
      onChange={onChange}
      renderInput={(params) => (
        <TextField 
          {...params} 
          label="Select Module" 
          variant="outlined" 
          size="medium"
        />
      )}
    />
  );
}
