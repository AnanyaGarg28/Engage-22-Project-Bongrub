module.exports = {
  content: ["./views/*.ejs"],
  plugins: [],
  theme: {
    extend: {
      colors: {
        mint: {
          500:"#a1ae7a"
        },
        darkblue: {
          500:"#2c3b4b"
        }
      }
    },
    fontFamily: {
      'oswald': ['Oswald', 'Arial', 'Helvetica', 'Nimbus Sans L', 'sans-serif'], 
      'lora': ['Lora', 'Arial', 'Helvetica', 'Nimbus Sans L', 'sans-serif'],
    }
  },
}