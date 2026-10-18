export interface ActivityCurriculum {
  id: string;
  world: string;
  title: string;
  grade: string;
  content: string;
  pda: string[];
  pdaIsSummary?: boolean;
  note?: string;
  objective: string;
  source: { title: string; page: number; url: string };
}

// Catálogo de referencias curriculares. Una actividad aporta evidencia parcial del PDA.
export const activityCurriculum: Record<string, ActivityCurriculum> = {
  "mathdata-rampas-lanzamiento": {
    id: "mathdata-rampas-lanzamiento",
    world: "MathData · Actividad 2",
    title: "Rampas de Lanzamiento",
    grade: "1.º de secundaria · Fase 6",
    content: "Funciones.",
    pda: ["Modela y resuelve diversas situaciones a través de ecuaciones proporcionales con constante positiva y negativa."],
    objective: "Interpretar el signo y el valor de la constante y relacionar una tabla, una gráfica y su ecuación.",
    source: {
      title: "SEP · Programa Sintético de la Fase 6 (2024)",
      page: 59,
      url: "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf",
    },
  },
  "mathnumbers-cofre-bienvenida": {
  "id": "mathnumbers-cofre-bienvenida",
  "world": "MathNumbers · Actividad 1",
  "title": "El Cofre de Bienvenida",
  "grade": "1.º de secundaria · Fase 6",
  "objective": "Convertir entre fracciones y decimales, comparar cantidades y explicar las estrategias.",
  "content": "Fracciones y decimales",
  "pda": [
    "Convertir entre fracciones y decimales mediante distintas estrategias."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 58,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  }
},
  "mathnumbers-radar-supervivencia": {
  "id": "mathnumbers-radar-supervivencia",
  "world": "MathNumbers · Actividad 2",
  "title": "Radar de Supervivencia",
  "grade": "1.º de secundaria · Fase 6",
  "objective": "Ubicar señales respecto al cero y comparar su posición.",
  "content": "Números positivos, negativos y orden",
  "pda": [
    "Comparar cantidades con signo tomando el cero como referencia."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 58,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  }
},
  "mathnumbers-ascensor-bunker": {
  "id": "mathnumbers-ascensor-bunker",
  "world": "MathNumbers · Actividad 3",
  "title": "Ascensor del Búnker",
  "grade": "1.º de secundaria · Fase 6",
  "objective": "Ordenar los pisos del búnker y explicar su ubicación.",
  "content": "Números positivos, negativos y orden",
  "pda": [
    "Comparar cantidades con signo tomando el cero como referencia."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 58,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  }
},
  "mathnumbers-escuadron-tactico": {
  "id": "mathnumbers-escuadron-tactico",
  "world": "MathNumbers · Actividad 4",
  "title": "Escuadrón Táctico",
  "grade": "1.º de secundaria · Fase 6",
  "objective": "Decidir qué operación realizar primero y revisar la secuencia.",
  "content": "Operaciones y sus relaciones inversas",
  "pda": [
    "Calcular respetando agrupaciones y prioridades de las operaciones."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 58,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  }
},
  "mathnumbers-espejos-boveda": {
  "id": "mathnumbers-espejos-boveda",
  "world": "MathNumbers · Actividad 5",
  "title": "Espejos de la Bóveda",
  "grade": "1.º de secundaria · Fase 6",
  "objective": "Reconocer transformaciones que conservan el resultado.",
  "content": "Operaciones y sus relaciones inversas",
  "pda": [
    "Argumentar las propiedades de las operaciones."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 58,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  }
},
  "mathnumbers-puente-prioridades": {
  "id": "mathnumbers-puente-prioridades",
  "world": "MathNumbers · Actividad 6",
  "title": "Puente de Prioridades",
  "grade": "1.º de secundaria · Fase 6",
  "objective": "Resolver expresiones con y sin agrupaciones.",
  "content": "Operaciones y sus relaciones inversas",
  "pda": [
    "Calcular respetando agrupaciones y prioridades de las operaciones."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 58,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  }
},
  "mathnumbers-enigma-variables": {
  "id": "mathnumbers-enigma-variables",
  "world": "MathNumbers · Actividad 7",
  "title": "El Enigma de Variables",
  "grade": "1.º de secundaria · Fase 6",
  "objective": "Interpretar una variable, formar una expresión y sustituir su valor.",
  "content": "Introducción al álgebra",
  "pda": [
    "Relacionar situaciones cotidianas con expresiones algebraicas."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 59,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  }
},
  "mathnumbers-simulador-codigos": {
  "id": "mathnumbers-simulador-codigos",
  "world": "MathNumbers · Actividad 8",
  "title": "Simulador de Códigos",
  "grade": "1.º de secundaria · Fase 6",
  "objective": "Reconocer la regla de un código y predecir otros términos.",
  "content": "Regularidades y patrones",
  "pda": [
    "Expresar algebraicamente patrones aritméticos."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 59,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  }
},
  "mathgeometry-actividad-1": {
  "id": "mathgeometry-actividad-1",
  "world": "MathGeometry · Actividad 1",
  "title": "El Constructor de Caminos",
  "grade": "1.º de secundaria · Fase 6",
  "objective": "Clasificar y construir triángulos y cuadriláteros, justificando sus propiedades.",
  "content": "Construcción y propiedades de figuras",
  "pda": [
    "Construir y clasificar figuras a partir de sus propiedades."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 60,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  },
  "note": "Incluye construcción digital y explicación. Completa y verifica el trazo con instrumentos en tu cuaderno; tu docente revisará esa evidencia."
},
  "mathgeometry-actividad-2": {
  "id": "mathgeometry-actividad-2",
  "world": "MathGeometry · Actividad 2",
  "title": "La Ruta Perdida",
  "grade": "1.º de secundaria · Fase 6",
  "objective": "Trazar segmentos y determinar su longitud con unidades.",
  "content": "Rectas y ángulos",
  "pda": [
    "Explorar segmentos, ángulos y sus relaciones."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 60,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  },
  "note": "Incluye construcción digital y explicación. Completa y verifica el trazo con instrumentos en tu cuaderno; tu docente revisará esa evidencia."
},
  "mathgeometry-actividad-3": {
  "id": "mathgeometry-actividad-3",
  "world": "MathGeometry · Actividad 3",
  "title": "Detectores de Giro",
  "grade": "1.º de secundaria · Fase 6",
  "objective": "Construir, medir y clasificar ángulos a partir de su apertura.",
  "content": "Rectas y ángulos",
  "pda": [
    "Explorar segmentos, ángulos y sus relaciones."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 60,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  },
  "note": "Incluye construcción digital y explicación. Completa y verifica el trazo con instrumentos en tu cuaderno; tu docente revisará esa evidencia."
},
  "mathgeometry-actividad-4": {
  "id": "mathgeometry-actividad-4",
  "world": "MathGeometry · Actividad 4",
  "title": "Cruce de Láseres",
  "grade": "1.º de secundaria · Fase 6",
  "objective": "Calcular ángulos y justificar sus relaciones en un cruce.",
  "content": "Rectas y ángulos",
  "pda": [
    "Explorar segmentos, ángulos y sus relaciones."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 60,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  },
  "note": "Incluye construcción digital y explicación. Completa y verifica el trazo con instrumentos en tu cuaderno; tu docente revisará esa evidencia."
},
  "mathgeometry-actividad-5": {
  "id": "mathgeometry-actividad-5",
  "world": "MathGeometry · Actividad 5",
  "title": "El Taller del Ingeniero",
  "grade": "1.º de secundaria · Fase 6",
  "objective": "Construir el punto medio y la mediatriz, y comprobar sus propiedades.",
  "content": "Construcción y propiedades de figuras",
  "pda": [
    "Realizar construcciones con regla y compás."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 60,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  },
  "note": "Incluye construcción digital y explicación. Completa y verifica el trazo con instrumentos en tu cuaderno; tu docente revisará esa evidencia."
},
  "mathgeometry-actividad-6": {
  "id": "mathgeometry-actividad-6",
  "world": "MathGeometry · Actividad 6",
  "title": "El Escudo Perfecto",
  "grade": "1.º de secundaria · Fase 6",
  "objective": "Construir una bisectriz y verificar la igualdad de las aperturas.",
  "content": "Construcción y propiedades de figuras",
  "pda": [
    "Realizar construcciones con regla y compás."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 60,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  },
  "note": "Incluye construcción digital y explicación. Completa y verifica el trazo con instrumentos en tu cuaderno; tu docente revisará esa evidencia."
},
  "mathgeometry-actividad-7": {
  "id": "mathgeometry-actividad-7",
  "world": "MathGeometry · Actividad 7",
  "title": "La Fortaleza Triangular",
  "grade": "1.º de secundaria · Fase 6",
  "objective": "Construir y distinguir altura, mediana y bisectriz en un triángulo.",
  "content": "Construcción y propiedades de figuras",
  "pda": [
    "Reconocer y trazar rectas notables."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 60,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  },
  "note": "Incluye construcción digital y explicación. Completa y verifica el trazo con instrumentos en tu cuaderno; tu docente revisará esa evidencia."
},
  "mathgeometry-actividad-8": {
  "id": "mathgeometry-actividad-8",
  "world": "MathGeometry · Actividad 8",
  "title": "El Centro de Control",
  "grade": "1.º de secundaria · Fase 6",
  "objective": "Trazar diagonales y comprobar sus propiedades en cuadriláteros.",
  "content": "Construcción y propiedades de figuras",
  "pda": [
    "Reconocer y trazar rectas notables."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 60,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  },
  "note": "Incluye construcción digital y explicación. Completa y verifica el trazo con instrumentos en tu cuaderno; tu docente revisará esa evidencia."
},
  "mathdata-generador-energia": {
  "id": "mathdata-generador-energia",
  "world": "MathData · Actividad 1",
  "title": "Generador de Energía Inversa",
  "grade": "2.º de secundaria · Ampliación · Fase 6",
  "objective": "Relacionar las dos cantidades de la tabla y revisar el producto constante.",
  "content": "Funciones",
  "pda": [
    "Interpretar relaciones inversas mediante tablas, gráficas y expresiones."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 59,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  },
  "note": "Ampliación: su PDA corresponde a otro grado; no sustituye el trabajo de primero."
},
  "mathdata-encuesta-tripulacion": {
  "id": "mathdata-encuesta-tripulacion",
  "world": "MathData · Actividad 3",
  "title": "Encuesta a la Tripulación",
  "grade": "1.º de secundaria · Fase 6",
  "objective": "Diseñar una encuesta, organizar sus datos y fundamentar una conclusión.",
  "content": "Obtención y representación de información",
  "pda": [
    "Analizar datos mediante tablas y gráficas."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 61,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  }
},
  "mathdata-holograma-reportes": {
  "id": "mathdata-holograma-reportes",
  "world": "MathData · Actividad 4",
  "title": "Holograma de Reportes",
  "grade": "1.º de secundaria · Fase 6",
  "objective": "Construir y justificar gráficas, comprobar su escala y comunicar conclusiones.",
  "content": "Obtención y representación de información",
  "pda": [
    "Analizar datos mediante tablas y gráficas."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 61,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  }
},
  "mathdata-sensor-frecuencias": {
  "id": "mathdata-sensor-frecuencias",
  "world": "MathData · Actividad 5",
  "title": "Sensor de Frecuencias",
  "grade": "1.º de secundaria · Fase 6",
  "objective": "Relacionar frecuencia absoluta, frecuencia relativa y porcentaje.",
  "content": "Interpretación de datos: tendencia central y dispersión",
  "pda": [
    "Interpretar frecuencias y medidas estadísticas para decidir."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 61,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  }
},
  "mathdata-nucleo-decisiones": {
  "id": "mathdata-nucleo-decisiones",
  "world": "MathData · Actividad 6",
  "title": "El Núcleo de Decisiones",
  "grade": "1.º de secundaria · Fase 6",
  "objective": "Calcular e interpretar media, mediana, moda y rango del conjunto.",
  "content": "Interpretación de datos: tendencia central y dispersión",
  "pda": [
    "Interpretar frecuencias y medidas estadísticas para decidir."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 61,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  }
},
  "mathdata-oraculo-estacion": {
  "id": "mathdata-oraculo-estacion",
  "world": "MathData · Actividad 7",
  "title": "El Oráculo de la Estación",
  "grade": "1.º de secundaria · Fase 6",
  "objective": "Identificar resultados posibles y comparar qué evento es más probable.",
  "content": "Azar y probabilidad",
  "pda": [
    "Comparar posibilidades y explorar resultados de eventos aleatorios."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 62,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  }
},
  "mathdata-sala-tres-caminos": {
  "id": "mathdata-sala-tres-caminos",
  "world": "MathData · Actividad 8",
  "title": "Sala de los Tres Caminos",
  "grade": "3.º de secundaria · Ampliación · Fase 6",
  "objective": "Analizar cómo las condiciones de un mecanismo relacionan sus eventos.",
  "content": "Azar y probabilidad",
  "pda": [
    "Analizar eventos complementarios, excluyentes e independientes."
  ],
  "pdaIsSummary": true,
  "source": {
    "title": "SEP · Programa Sintético de la Fase 6 (2024)",
    "page": 62,
    "url": "https://educacionbasica.sep.gob.mx/wp-content/uploads/2024/06/Programa_Sintetico_Fase_6.pdf"
  },
  "note": "Ampliación: su PDA corresponde a otro grado; no sustituye el trabajo de primero."
},
};
