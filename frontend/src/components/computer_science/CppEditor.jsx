import React, { useState } from 'react';

function CppEditor() {
  const [code, setCode] = useState('#include <iostream>\n\nint main() {\n    std::cout << "Hello from C++!" << std::endl;\n    return 0;\n}\n'); 
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [executionData, setExecutionData] = useState([]); 

  const handleRunCode = async () => {
    setIsLoading(true);
    setError(null);
    setOutput('');
    setExecutionData([]);

    try {
      const response = await fetch('http://localhost:8000/cpp-compiler/compile-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, input }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Eroare la rularea codului C++');
      }

      setOutput(result.output);
      setExecutionData(result.execution_data || []);

    } catch (err) {
      setError(err.message || 'A apărut o eroare necunoscută.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-900 rounded-lg shadow-xl p-6">
      <h2 className="text-2xl font-bold text-white mb-4">Editor C++ și Vizualizare 3D</h2>
      
      {error && (
        <div className="bg-red-700 text-white p-3 rounded-md mb-4">
          Eroare: {error}
        </div>
      )}

      <div className="flex flex-1 gap-6 mb-6">
        <div className="flex-1 flex flex-col">
          <label htmlFor="cpp-code" className="text-gray-300 mb-2">Cod C++:</label>
          <textarea
            id="cpp-code"
            className="flex-1 bg-gray-800 text-gray-100 p-4 rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Scrie codul C++ aici..."
            rows="15"
          ></textarea>
        </div>

        <div className="flex-1 flex flex-col">
          <label htmlFor="cpp-input" className="text-gray-300 mb-2">Input (opțional):</label>
          <textarea
            id="cpp-input"
            className="flex-1 bg-gray-800 text-gray-100 p-4 rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Introdu input-ul pentru program (dacă este cazul)..."
            rows="5"
          ></textarea>
          <button
            onClick={handleRunCode}
            disabled={isLoading}
            className="mt-4 px-6 py-3 rounded-lg transition-all 
                       bg-blue-600 hover:bg-blue-700 text-white font-semibold
                       shadow-lg hover:shadow-xl flex items-center justify-center gap-2
                       border-2 border-blue-500 hover:border-blue-600
                       transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Se compilează și rulează...' : 'Compilează și Rulează C++'}
          </button>
        </div>
      </div>

      <div className="flex flex-col mb-6">
        <label htmlFor="cpp-output" className="text-gray-300 mb-2">Output:</label>
        <textarea
          id="cpp-output"
          className="bg-gray-800 text-gray-100 p-4 rounded-md font-mono text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
          value={output}
          readOnly
          rows="8"
        ></textarea>
      </div>

      <div className="flex-1 bg-gray-800 rounded-lg flex items-center justify-center p-6">
        {executionData.length > 0 ? (
          <p className="text-gray-400 text-lg">
            Vizualizarea 3D a datelor va apărea aici.
          </p>
        ) : (
          <p className="text-gray-400 text-lg">
            Așteaptă rularea codului pentru a vedea vizualizarea 3D.
          </p>
        )}
      </div>
    </div>
  );
}

export default CppEditor; 