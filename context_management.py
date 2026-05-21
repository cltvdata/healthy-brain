import os
import json
import base64
from pathlib import Path
import google.generativeai as genai

# Configuración de variables de entorno
# Asegúrate de configurar GEMINI_API_KEY en tu entorno antes de ejecutar
API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_API_KEY")
genai.configure(api_key=API_KEY)

# Configuración del Modelo
MODEL_ID = "gemini-1.5-pro-latest" # O gemini-1.5-flash-latest dependiendo del balance costo/velocidad

def load_local_context():
    """
    Carga las instrucciones maestras del sistema y el esquema de datos.
    """
    try:
        # Cargar instrucciones del sistema
        with open('system_instructions.md', 'r', encoding='utf-8') as f:
            system_instructions = f.read()

        # Cargar el esquema de funciones de AI Studio
        with open('data_schema.json', 'r', encoding='utf-8') as f:
            data_schema_raw = json.load(f)
            # Extraer las declaraciones de herramientas
            tools = data_schema_raw.get('tools', [])
            
        return system_instructions, tools
    except Exception as e:
        print(f"Error cargando contexto local: {e}")
        return None, None

def encode_image(image_path):
    """Codifica una imagen en Base64 para consumo del modelo."""
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

class NeuroVitalAgent:
    def __init__(self):
        print("Iniciando Agente NeuroVital 2026...")
        system_instruction, self.tools = load_local_context()
        
        if not system_instruction or not self.tools:
            raise ValueError("Falta contexto del sistema o herramientas. Abortando.")

        # Inicializar el modelo con el System Instruction
        self.model = genai.GenerativeModel(
            model_name=MODEL_ID,
            system_instruction=system_instruction,
            tools=self.tools
        )
        print("Agente cargado exitosamente.")

    def analyze_biological_input(self, image_path, user_context="Fase Lútea, 8h de sueño previo."):
        """
        Ejecuta el modelo pasando una imagen y forzando la herramienta 'analyze_biological_input'.
        """
        print(f"\nAnalizando entrada biológica: {image_path}")
        try:
            # En la versión del SDK de Python, las imágenes se pasan usando PIL o directamente con datos crudos.
            import PIL.Image
            img = PIL.Image.open(image_path)
            
            prompt = f"Analiza la imagen adjunta. Contexto del usuario: {user_context}."
            
            # Ejecutar el modelo pidiéndole que use herramientas
            response = self.model.generate_content(
                [prompt, img],
                tool_config={"function_calling_config": {"mode": "ANY"}} # Fuerza a llamar la función
            )

            # Extraer los argumentos generados para la función
            if response.parts and hasattr(response.parts[0], 'function_call'):
                fc = response.parts[0].function_call
                if fc.name == "analyze_biological_input":
                    args = dict(fc.args)
                    print("\n[Éxito] Inferencia Estructurada Generada:")
                    print(json.dumps(args, indent=2, ensure_ascii=False))
                    return args
            else:
                print("El modelo no llamó la función esperada.")
                print(response.text)
                return None

        except Exception as e:
            print(f"Error en la inferencia: {e}")
            return None

if __name__ == "__main__":
    print("--- Entorno de Prueba Google AI Studio (Local) ---")
    agent = NeuroVitalAgent()
    
    # Ejemplo de uso: (Descomentar para probar con una imagen local)
    # image_file = "ruta/a/foto_de_comida_o_wearable.jpg"
    # if os.path.exists(image_file):
    #     resultado = agent.analyze_biological_input(image_file)
    #     # Aquí puedes conectar el 'resultado' directamente a tu base de datos Firebase o retornar al frontend.
    # else:
    #     print(f"Coloca una imagen de prueba en {image_file} para ejecutar.")
