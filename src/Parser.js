function parseSExpression(input) {
    let index = 0;

    // Helper function to skip whitespace
    function skipWhitespace() {
        while (index < input.length && /\s/.test(input[index])) {
            index++;
        }
    }

    // Helper function to parse an atom (number, symbol, or string)
    function parseAtom() {
        skipWhitespace();
        if (input[index] === '"') {
            return parseString();
        }

        let atom = "";
        while (index < input.length && /[^\s\(\)]/.test(input[index])) {
            atom += input[index++];
        }

        const number = Number(atom);
        return Number.isNaN(number) ? { type: "symbol", value: atom } : { type: "number", value: number };
    }

    // Helper function to parse strings
    function parseString() {
        const quoteType = input[index]; // Can be " or '
        let str = "";
        index++; // Skip the opening quote

        while (index < input.length && input[index] !== quoteType) {
            if (input[index] === '\\') { // Handle escape sequences
                index++;
                if (input[index] === '"') {
                    str += input[index]; // Add escaped quotes
                } else if (input[index] === 'n') {
                    str += '\n'; // Handle newline escape
                } else if (input[index] === 't') {
                    str += '\t'; // Handle tab escape
                } else {
                    str += '\\' + input[index]; // Unrecognized escape, add as is
                }
            } else {
                str += input[index];
            }
            index++;
        }
        index++; // Skip the closing quote
        return { type: "string", value: str };
    }

    // Main function to parse an expression
    function parseExpression() {
        skipWhitespace();
        if (input[index] === '(') {
            index++;  // Skip '('
            const list = [];
            skipWhitespace();

            while (index < input.length && input[index] !== ')') {
                list.push(parseExpression());
                skipWhitespace();
            }
            index++;  // Skip ')'
            return { type: "list", value: list };
        } else if (input[index] === "'") {
            index++;  // Skip the quote character
            return { type: "list", value: [{ type: "symbol", value: "quote" }, parseExpression()] }; // Treat quoted expression as ('quote expr)
        } else if (input[index] === "`") {
            index++;  // Skip the quote character
            return { type: "list", value: [{ type: "symbol", value: "quasiquote" }, parseExpression()] };
        } else if (input[index] === ",") {
            index++;  // Skip the unquote character
            if (input[index] === "@") {
              index++;  // Skip the at character
              return { type: "list", value: [{ type: "symbol", value: "unquote-splicing" }, parseExpression()] };
	   } else {
              return { type: "list", value: [{ type: "symbol", value: "unquote" }, parseExpression()] };
	   }
        } else {
            return parseAtom();
        }
    }

    // Main entry point to parse the full input
    skipWhitespace();
    if (index >= input.length) {
      return { type: "undefined", value: undefined };
    }
    return parseExpression();
}

export default parseSExpression;
