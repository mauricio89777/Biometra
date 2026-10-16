import React, { useState } from 'react';

// Icono biomecánico/tecnológico para el logo BIOMETRA
const BiometraLogoIcon = () => (
  <svg 
    width="32" 
    height="32" 
    viewBox="0 0 100 100" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    style={{ verticalAlign: 'middle' }}
  >
    <rect width="100" height="100" rx="20" fill="#020617" />
    <path d="M20 50 Q35 20, 50 50 T80 50" stroke="#00FF87" strokeWidth="6" strokeLinecap="round" fill="none" />
    <path d="M20 50 Q35 80, 50 50 T80 50" stroke="#38bdf8" strokeWidth="6" strokeLinecap="round" fill="none" />
    <circle cx="50" cy="50" r="10" fill="#00FF87" />
    <circle cx="50" cy="50" r="4" fill="#020617" />
    <circle cx="20" cy="50" r="5" fill="#38bdf8" />
    <circle cx="80" cy="50" r="5" fill="#00FF87" />
  </svg>
);

export default function Gps({ onNavigate }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRegion, setFilterRegion] = useState('todas');
  const [filterMarca, setFilterMarca] = useState('todas');

  // BASE DE DATOS UNIFICADA CON TODAS LAS REGIONES Y MARCAS SOLICITADAS
  const gimnasiosChile = [
    // ==========================================
    // XV - ARICA Y PARINACOTA
    // ==========================================
    { id: 1, marca: 'Smart Fit', nombre: 'Smart Fit - Sucursal Arica', comuna: 'Arica', region: 'Arica y Parinacota', direccion: 'Av. Diego Portales 157, Arica', distancia: '2.048 km', telefono: '+56 58 220 1100', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Diego+Portales+157+Arica', fechaApertura: '10/05/2020', arrendador: 'Comercial Arica', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 2, marca: 'Smart Fit', nombre: 'Smart Fit - Sucursal Mallplaza Arica', comuna: 'Arica', region: 'Arica y Parinacota', direccion: 'Av. Diego Portales 640, Arica', distancia: '2.050 km', telefono: '+56 58 220 1101', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Mall+Plaza+Arica', fechaApertura: '15/03/2021', arrendador: 'Mallplaza Arica', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },

    // ==========================================
    // I - TARAPACÁ
    // ==========================================
    { id: 3, marca: 'Smart Fit', nombre: 'Smart Fit - Iquique Vivar', comuna: 'Iquique', region: 'Tarapacá', direccion: 'Vivar 850, Iquique', distancia: '1.780 km', telefono: '+56 57 251 3300', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Vivar+Iquique', fechaApertura: '10/04/2021', arrendador: 'Comercial Vivar', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 4, marca: 'Smart Fit', nombre: 'Smart Fit - Mallplaza Iquique', comuna: 'Iquique', region: 'Tarapacá', direccion: 'Av. Héroes de la Concepción 2555, Iquique', distancia: '1.782 km', telefono: '+56 57 251 3301', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Mallplaza+Iquique', fechaApertura: '22/09/2022', arrendador: 'Mallplaza', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 5, marca: 'Pacific Fitness', nombre: 'Pacific Fitness - Sede Iquique', comuna: 'Iquique', region: 'Tarapacá', direccion: 'Tarapacá 465, Iquique', distancia: '1.781 km', telefono: '+56 57 242 1122', tipo: 'Gimnasio Comercial', mapaQuery: 'Pacific+Fitness+Iquique', fechaApertura: '15/05/2016', arrendador: 'Inmobiliaria Tarapacá', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$24.000 CLP' },
    { id: 6, marca: 'Sportlife', nombre: 'Sportlife - Sede Teresa Wilms Montt', comuna: 'Iquique', region: 'Tarapacá', direccion: 'Teresa Wilms Montt 2260, Iquique', distancia: '1.785 km', telefono: '+56 57 242 8899', tipo: 'Centro Deportivo', mapaQuery: 'Sportlife+Teresa+Wilms+Montt+Iquique', fechaApertura: '04/11/2017', arrendador: 'Rentas Iquique', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$32.000 CLP' },

    // ==========================================
    // II - ANTOFAGASTA
    // ==========================================
    { id: 7, marca: 'Smart Fit', nombre: 'Smart Fit - Antofagasta La Portada', comuna: 'Antofagasta', region: 'Antofagasta', direccion: 'Av. Pedro Aguirre Cerda 10578, Antofagasta', distancia: '1.358 km', telefono: '+56 55 264 7701', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+La+Portada+Antofagasta', fechaApertura: '10/03/2022', arrendador: 'Paseo La Portada', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 8, marca: 'Smart Fit', nombre: 'Smart Fit - Jumbo Punto de Encuentro', comuna: 'Antofagasta', region: 'Antofagasta', direccion: 'Av. Angamos 745, Antofagasta', distancia: '1.360 km', telefono: '+56 55 264 7702', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Jumbo+Angamos+Antofagasta', fechaApertura: '15/11/2021', arrendador: 'Cencosud', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 9, marca: 'Smart Fit', nombre: 'Smart Fit - Mallplaza Antofagasta', comuna: 'Antofagasta', region: 'Antofagasta', direccion: 'Av. Balmaceda 2472, Antofagasta', distancia: '1.361 km', telefono: '+56 55 264 7703', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Mallplaza+Antofagasta', fechaApertura: '12/01/2019', arrendador: 'Mallplaza', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 10, marca: 'Smart Fit', nombre: 'Smart Fit - Cenco Angamos', comuna: 'Antofagasta', region: 'Antofagasta', direccion: 'Av. Angamos 0211, Antofagasta', distancia: '1.362 km', telefono: '+56 55 264 7704', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Cenco+Angamos+Antofagasta', fechaApertura: '05/08/2023', arrendador: 'Cencosud Shopping', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 11, marca: 'Smart Fit', nombre: 'Smart Fit - Sucursal Calama', comuna: 'Calama', region: 'Antofagasta', direccion: 'Av. Chorrillos 1631, Calama', distancia: '1.540 km', telefono: '+56 55 264 7705', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Calama', fechaApertura: '18/06/2020', arrendador: 'Mallplaza Calama', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 12, marca: 'Sportlife', nombre: 'Sportlife - Antofagasta Angamos', comuna: 'Antofagasta', region: 'Antofagasta', direccion: 'Av. Angamos 1215, Antofagasta', distancia: '1.360 km', telefono: '+56 55 288 3311', tipo: 'Centro Deportivo', mapaQuery: 'Sportlife+Angamos+Antofagasta', fechaApertura: '14/07/2018', arrendador: 'Inmobiliaria Angamos', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$32.000 CLP' },
    { id: 13, marca: 'Sportlife', nombre: 'Sportlife - Antofagasta Espacio Urbano', comuna: 'Antofagasta', region: 'Antofagasta', direccion: 'Zenteno 21, Antofagasta', distancia: '1.362 km', telefono: '+56 55 288 3312', tipo: 'Centro Deportivo', mapaQuery: 'Sportlife+Espacio+Urbano+Antofagasta', fechaApertura: '01/10/2020', arrendador: 'Espacio Urbano', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$32.000 CLP' },

    // ==========================================
    // V - VALPARAÍSO
    // ==========================================
    { id: 14, marca: 'Smart Fit', nombre: 'Smart Fit - Valparaíso Plaza Victoria', comuna: 'Valparaíso', region: 'Valparaíso', direccion: 'Av. Brasil 1650, Valparaíso', distancia: '114 km', telefono: '+56 32 255 4401', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Plaza+Victoria+Valparaiso', fechaApertura: '14/06/2019', arrendador: 'Paseo Victoria', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 15, marca: 'Smart Fit', nombre: 'Smart Fit - Valparaíso Paseo del Puerto', comuna: 'Valparaíso', region: 'Valparaíso', direccion: 'Plaza Sotomayor 50, Valparaíso', distancia: '116 km', telefono: '+56 32 255 4402', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Paseo+del+Puerto+Valparaiso', fechaApertura: '20/11/2021', arrendador: 'EPV', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 16, marca: 'Smart Fit', nombre: 'Smart Fit - Viña Paseo Viña Centro', comuna: 'Viña del Mar', region: 'Valparaíso', direccion: 'Álvarez 646, Viña del Mar', distancia: '118 km', telefono: '+56 32 255 4403', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Paseo+Vina+Centro', fechaApertura: '10/01/2020', arrendador: 'Paseo Viña', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 17, marca: 'Smart Fit', nombre: 'Smart Fit - Quilpué Mondrian', comuna: 'Quilpué', region: 'Valparaíso', direccion: 'Claudio Vicuña 680, Quilpué', distancia: '110 km', telefono: '+56 32 255 4404', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Mondrian+Quilpue', fechaApertura: '05/08/2022', arrendador: 'Edificio Mondrian', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 18, marca: 'Smart Fit', nombre: 'Smart Fit - Quilpué Mall', comuna: 'Quilpué', region: 'Valparaíso', direccion: 'Av. Los Carrera 700, Quilpué', distancia: '111 km', telefono: '+56 32 255 4405', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Mall+Quilpue', fechaApertura: '12/12/2022', arrendador: 'Mall Plaza del Sol', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 19, marca: 'Smart Fit', nombre: 'Smart Fit - Villa Alemana Av. Valparaíso', comuna: 'Villa Alemana', region: 'Valparaíso', direccion: 'Av. Valparaíso 500, Villa Alemana', distancia: '105 km', telefono: '+56 32 255 4406', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Villa+Alemana', fechaApertura: '18/03/2023', arrendador: 'Paseo Villa Alemana', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 20, marca: 'Smart Fit', nombre: 'Smart Fit - Villa Alemana Líder Peñablanca', comuna: 'Villa Alemana', region: 'Valparaíso', direccion: 'Sarmiento 1100, Peñablanca', distancia: '102 km', telefono: '+56 32 255 4407', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Lider+Penablanca', fechaApertura: '01/09/2023', arrendador: 'Walmart', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 21, marca: 'Smart Fit', nombre: 'Smart Fit - Curauma', comuna: 'Valparaíso / Curauma', region: 'Valparaíso', direccion: 'Av. Cardenal Samoré 2300, Curauma', distancia: '100 km', telefono: '+56 32 255 4408', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Curauma', fechaApertura: '15/05/2021', arrendador: 'Outlet Vivo Curauma', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 22, marca: 'Smart Fit', nombre: 'Smart Fit - Los Andes', comuna: 'Los Andes', region: 'Valparaíso', direccion: 'Av. Santa Teresa 683, Los Andes', distancia: '80 km', telefono: '+56 34 255 4409', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Los+Andes', fechaApertura: '10/10/2022', arrendador: 'Espacio Los Andes', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 23, marca: 'Pacific Fitness', nombre: 'Pacific Fitness - Valparaíso', comuna: 'Valparaíso', region: 'Valparaíso', direccion: 'Condell 1230, Valparaíso', distancia: '115 km', telefono: '+56 32 268 9901', tipo: 'Gimnasio Comercial', mapaQuery: 'Pacific+Fitness+Valparaiso', fechaApertura: '10/02/2015', arrendador: 'Comercial Condell', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$24.000 CLP' },
    { id: 24, marca: 'Pacific Fitness', nombre: 'Pacific Fitness - Viña del Mar', comuna: 'Viña del Mar', region: 'Valparaíso', direccion: 'Arlegui 440, Viña del Mar', distancia: '118 km', telefono: '+56 32 268 9902', tipo: 'Gimnasio Comercial', mapaQuery: 'Pacific+Fitness+Vina+del+Mar', fechaApertura: '18/04/2015', arrendador: 'Inmobiliaria Arlegui', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$24.000 CLP' },
    { id: 25, marca: 'Pacific Fitness', nombre: 'Pacific Fitness - Quilpué', comuna: 'Quilpué', region: 'Valparaíso', direccion: 'Vicente Suárez 550, Quilpué', distancia: '110 km', telefono: '+56 32 268 9903', tipo: 'Gimnasio Comercial', mapaQuery: 'Pacific+Fitness+Quilpue', fechaApertura: '22/08/2016', arrendador: 'Plaza Quilpué', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$24.000 CLP' },
    { id: 26, marca: 'Pacific Fitness', nombre: 'Pacific Fitness - Quillota', comuna: 'Quillota', region: 'Valparaíso', direccion: 'O\'Higgins 320, Quillota', distancia: '120 km', telefono: '+56 33 268 9904', tipo: 'Gimnasio Comercial', mapaQuery: 'Pacific+Fitness+Quillota', fechaApertura: '05/11/2017', arrendador: 'Centro Quillota', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$24.000 CLP' },
    { id: 27, marca: 'Pacific Fitness', nombre: 'Pacific Fitness - Los Andes', comuna: 'Los Andes', region: 'Valparaíso', direccion: 'Maipú 430, Los Andes', distancia: '82 km', telefono: '+56 34 268 9905', tipo: 'Gimnasio Comercial', mapaQuery: 'Pacific+Fitness+Los+Andes', fechaApertura: '14/01/2018', arrendador: 'Comercial Los Andes', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$24.000 CLP' },
    { id: 28, marca: 'Power Fitness', nombre: 'Power Fitness - Reñaca Sede 1', comuna: 'Viña del Mar', region: 'Valparaíso', direccion: 'Av. Borgoño 14500, Reñaca', distancia: '124 km', telefono: '+56 32 283 1122', tipo: 'Musculación y Deporte', mapaQuery: 'Power+Fitness+Renaca', fechaApertura: '09/09/2021', arrendador: 'Power Gym', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$25.000 CLP' },
    { id: 29, marca: 'Power Fitness', nombre: 'Power Fitness - Reñaca Sede 2', comuna: 'Viña del Mar', region: 'Valparaíso', direccion: 'Av. Edmundo Eluchans 2200, Reñaca', distancia: '125 km', telefono: '+56 32 283 1123', tipo: 'Musculación y Fitness', mapaQuery: 'Power+Fitness+Eluchans+Renaca', fechaApertura: '10/03/2022', arrendador: 'Plaza Eluchans', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$25.000 CLP' },
    { id: 30, marca: 'Power Fitness', nombre: 'Power Fitness - San Antonio', comuna: 'San Antonio', region: 'Valparaíso', direccion: 'Av. Barros Luco 1600, San Antonio', distancia: '110 km', telefono: '+56 35 283 1124', tipo: 'Musculación y Fitness', mapaQuery: 'Power+Fitness+San+Antonio', fechaApertura: '18/11/2022', arrendador: 'Puerto San Antonio', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$25.000 CLP' },
    { id: 31, marca: 'Sportlife', nombre: 'Sportlife - Valparaíso Avenida Brasil', comuna: 'Valparaíso', region: 'Valparaíso', direccion: 'Av. Brasil 1980, Valparaíso', distancia: '115 km', telefono: '+56 32 211 0099', tipo: 'Centro Deportivo', mapaQuery: 'Sportlife+Avenida+Brasil+Valparaiso', fechaApertura: '11/04/2018', arrendador: 'Puerto Valparaíso', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$28.000 CLP' },
    { id: 32, marca: 'Sportlife', nombre: 'Sportlife - Viña del Mar', comuna: 'Viña del Mar', region: 'Valparaíso', direccion: '13 Norte 853, Viña del Mar', distancia: '119 km', telefono: '+56 32 211 0100', tipo: 'Centro Deportivo', mapaQuery: 'Sportlife+Vina+del+Mar+13+Norte', fechaApertura: '08/08/2016', arrendador: 'Inmobiliaria Viña', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$32.000 CLP' },

    // ==========================================
    // VIII - BIOBÍO
    // ==========================================
    { id: 33, marca: 'Smart Fit', nombre: 'Smart Fit - Concepción Centro', comuna: 'Concepción', region: 'Biobío', direccion: 'Barros Arana 1068, Concepción', distancia: '490 km', telefono: '+56 41 270 3344', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Barros+Arana+Concepcion', fechaApertura: '18/09/2019', arrendador: 'Galería Martinez', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 34, marca: 'Smart Fit', nombre: 'Smart Fit - Mallplaza Trébol', comuna: 'Talcahuano', region: 'Biobío', direccion: 'Av. Jorge Alessandri 3177, Talcahuano', distancia: '495 km', telefono: '+56 41 270 3345', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Mallplaza+Trebol', fechaApertura: '10/10/2017', arrendador: 'Mallplaza', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 35, marca: 'Smart Fit', nombre: 'Smart Fit - Mallplaza Mirador Biobío', comuna: 'Concepción', region: 'Biobío', direccion: 'Los Carrera 301, Concepción', distancia: '491 km', telefono: '+56 41 270 3346', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Mirador+Biobio', fechaApertura: '12/03/2021', arrendador: 'Mallplaza', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 36, marca: 'Smart Fit', nombre: 'Smart Fit - San Pedro de la Paz', comuna: 'San Pedro de la Paz', region: 'Biobío', direccion: 'Av. Pedro Aguirre Cerda 1105, San Pedro', distancia: '493 km', telefono: '+56 41 270 3347', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+San+Pedro+de+la+Paz', fechaApertura: '01/12/2022', arrendador: 'Paseo San Pedro', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 37, marca: 'Smart Fit', nombre: 'Smart Fit - Los Ángeles', comuna: 'Los Ángeles', region: 'Biobío', direccion: 'Valdivia 440, Los Ángeles', distancia: '510 km', telefono: '+56 43 270 3348', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Los+Angeles+Chile', fechaApertura: '15/07/2021', arrendador: 'Mall Plaza 7', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 38, marca: 'Smart Fit', nombre: 'Smart Fit - Coronel', comuna: 'Coronel', region: 'Biobío', direccion: 'Carlos Pratt 1200, Coronel', distancia: '500 km', telefono: '+56 41 270 3349', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Coronel', fechaApertura: '10/05/2023', arrendador: 'Paseo Coronel', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 39, marca: 'Sportlife', nombre: 'Sportlife - Concepción Centro', comuna: 'Concepción', region: 'Biobío', direccion: 'O\'Higgins 680, Concepción', distancia: '490 km', telefono: '+56 41 222 5588', tipo: 'Centro Deportivo', mapaQuery: 'Sportlife+Concepcion+Centro', fechaApertura: '15/05/2016', arrendador: 'Inmobiliaria Concepción', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$32.000 CLP' },
    { id: 40, marca: 'Sportlife', nombre: 'Sportlife - San Pedro de la Paz', comuna: 'San Pedro de la Paz', region: 'Biobío', direccion: 'Av. Michimalonco 1020, San Pedro', distancia: '493 km', telefono: '+56 41 222 5589', tipo: 'Centro Deportivo', mapaQuery: 'Sportlife+San+Pedro+de+la+Paz', fechaApertura: '10/10/2018', arrendador: 'Michimalonco Plaza', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$32.000 CLP' },
    { id: 41, marca: 'Sportlife', nombre: 'Sportlife - Los Ángeles', comuna: 'Los Ángeles', region: 'Biobío', direccion: 'Av. Alemania 850, Los Ángeles', distancia: '512 km', telefono: '+56 43 222 5590', tipo: 'Centro Deportivo', mapaQuery: 'Sportlife+Los+Angeles+Chile', fechaApertura: '04/04/2019', arrendador: 'Inversiones Los Ángeles', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$32.000 CLP' },
    { id: 42, marca: 'Pacific Fitness', nombre: 'Pacific Fitness - Concepción', comuna: 'Concepción', region: 'Biobío', direccion: 'Caupolicán 450, Concepción', distancia: '490 km', telefono: '+56 41 224 1122', tipo: 'Gimnasio Comercial', mapaQuery: 'Pacific+Fitness+Concepcion', fechaApertura: '20/08/2015', arrendador: 'Comercial Biobío', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$24.000 CLP' },

    // ==========================================
    // IX - LA ARAUCANÍA
    // ==========================================
    { id: 43, marca: 'Smart Fit', nombre: 'Smart Fit - Temuco Centro', comuna: 'Temuco', region: 'Araucanía', direccion: 'Bulnes 655, Temuco', distancia: '670 km', telefono: '+56 45 299 1120', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Bulnes+Temuco', fechaApertura: '08/04/2020', arrendador: 'Plaza Bulnes', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 44, marca: 'Smart Fit', nombre: 'Smart Fit - Mallplaza Temuco / Alemania', comuna: 'Temuco', region: 'Araucanía', direccion: 'Av. Alemania 0945, Temuco', distancia: '671 km', telefono: '+56 45 299 1121', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Mallplaza+Temuco', fechaApertura: '10/11/2018', arrendador: 'Mallplaza', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 45, marca: 'Smart Fit', nombre: 'Smart Fit - Portal Temuco', comuna: 'Temuco', region: 'Araucanía', direccion: 'Av. Alemania 0671, Temuco', distancia: '671 km', telefono: '+56 45 299 1122', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Portal+Temuco', fechaApertura: '15/11/2021', arrendador: 'Cencosud', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 46, marca: 'Sportlife', nombre: 'Sportlife - Sede Temuco', comuna: 'Temuco', region: 'Araucanía', direccion: 'Av. Alemania 0825, Temuco', distancia: '670 km', telefono: '+56 45 277 6655', tipo: 'Centro Deportivo', mapaQuery: 'Sportlife+Temuco', fechaApertura: '04/07/2019', arrendador: 'Inversiones Araucanía', horarioApertura: '07:00 - 22:00 hrs', costoMatricula: '$28.000 CLP' },
    { id: 47, marca: 'Pacific Fitness', nombre: 'Pacific Fitness - Villarrica', comuna: 'Villarrica', region: 'Araucanía', direccion: 'Pedro de Valdivia 520, Villarrica', distancia: '740 km', telefono: '+56 45 241 8899', tipo: 'Gimnasio Comercial', mapaQuery: 'Pacific+Fitness+Villarrica', fechaApertura: '12/12/2017', arrendador: 'Villarrica Plaza', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$24.000 CLP' },

    // ==========================================
    // RM - REGIÓN METROPOLITANA
    // ==========================================
    // PACIFIC FITNESS RM
    { id: 48, marca: 'Pacific Fitness', nombre: 'Pacific Fitness - Santiago Centro (Merced)', comuna: 'Santiago Centro', region: 'RM', direccion: 'Merced 838 (Edificio Casa Colorada)', distancia: '3.2 km', telefono: '+56 2 2638 1100', tipo: 'Gimnasio Comercial', mapaQuery: 'Pacific+Fitness+Merced+838+Santiago', fechaApertura: '10/05/2014', arrendador: 'Edificio Casa Colorada', horarioApertura: '06:00 - 23:00 hrs', costoMatricula: '$25.000 CLP' },
    { id: 49, marca: 'Pacific Fitness', nombre: 'Pacific Fitness - Santiago Centro (Nataniel)', comuna: 'Santiago Centro', region: 'RM', direccion: 'Nataniel Cox 1187, esq. Santiaguillo', distancia: '3.8 km', telefono: '+56 2 2638 1101', tipo: 'Gimnasio Comercial', mapaQuery: 'Pacific+Fitness+Nataniel+Cox+1187', fechaApertura: '12/08/2015', arrendador: 'Inmobiliaria Nataniel', horarioApertura: '06:00 - 23:00 hrs', costoMatricula: '$25.000 CLP' },
    { id: 50, marca: 'Pacific Fitness', nombre: 'Pacific Fitness - Ñuñoa (Campo de Deportes)', comuna: 'Ñuñoa', region: 'RM', direccion: 'Av. Campo de Deportes 330', distancia: '4.1 km', telefono: '+56 2 2638 1102', tipo: 'Gimnasio Comercial', mapaQuery: 'Pacific+Fitness+Campo+de+Deportes+330', fechaApertura: '20/03/2016', arrendador: 'Deportes Ñuñoa', horarioApertura: '06:00 - 23:00 hrs', costoMatricula: '$25.000 CLP' },
    { id: 51, marca: 'Pacific Fitness', nombre: 'Pacific Fitness - La Reina (Príncipe de Gales)', comuna: 'La Reina', region: 'RM', direccion: 'Príncipe de Gales 7271', distancia: '7.5 km', telefono: '+56 2 2638 1103', tipo: 'Gimnasio Comercial', mapaQuery: 'Pacific+Fitness+Principe+de+Gales+7271', fechaApertura: '15/11/2017', arrendador: 'Plaza La Reina', horarioApertura: '06:00 - 23:00 hrs', costoMatricula: '$25.000 CLP' },
    { id: 52, marca: 'Pacific Fitness', nombre: 'Pacific Fitness - Las Condes', comuna: 'Las Condes', region: 'RM', direccion: 'Av. Las Condes 14453', distancia: '10.2 km', telefono: '+56 2 2638 1104', tipo: 'Gimnasio Comercial', mapaQuery: 'Pacific+Fitness+Av+Las+Condes+14453', fechaApertura: '01/04/2018', arrendador: 'Las Condes Center', horarioApertura: '06:00 - 23:00 hrs', costoMatricula: '$25.000 CLP' },
    { id: 53, marca: 'Pacific Fitness', nombre: 'Pacific Fitness - Peñalolén', comuna: 'Peñalolén', region: 'RM', direccion: 'Av. Tobalaba 12175, Local 205', distancia: '8.0 km', telefono: '+56 2 2638 1105', tipo: 'Gimnasio Comercial', mapaQuery: 'Pacific+Fitness+Tobalaba+12175', fechaApertura: '10/10/2019', arrendador: 'Strip Center Tobalaba', horarioApertura: '06:00 - 23:00 hrs', costoMatricula: '$25.000 CLP' },

    // SPORTLIFE RM
    { id: 54, marca: 'Sportlife', nombre: 'Sportlife - Vitacura', comuna: 'Vitacura', region: 'RM', direccion: 'Av. Vitacura 2640', distancia: '5.0 km', telefono: '+56 2 2240 3301', tipo: 'Centro Deportivo', mapaQuery: 'Sportlife+Av+Vitacura+2640', fechaApertura: '05/05/2015', arrendador: 'Inmobiliaria Vitacura', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$32.000 CLP' },
    { id: 55, marca: 'Sportlife', nombre: 'Sportlife - San Miguel', comuna: 'San Miguel', region: 'RM', direccion: 'Gran Avenida José Miguel Carrera 4311, local S01', distancia: '8.2 km', telefono: '+56 2 2240 3302', tipo: 'Centro Deportivo', mapaQuery: 'Sportlife+Gran+Avenida+4311', fechaApertura: '18/09/2016', arrendador: 'Espacio San Miguel', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$32.000 CLP' },
    { id: 56, marca: 'Sportlife', nombre: 'Sportlife - Las Condes (Los Militares)', comuna: 'Las Condes', region: 'RM', direccion: 'Los Militares 5890', distancia: '4.5 km', telefono: '+56 2 2240 3303', tipo: 'Centro Deportivo', mapaQuery: 'Sportlife+Los+Militares+5890', fechaApertura: '22/01/2017', arrendador: 'Edificio Los Militares', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$32.000 CLP' },
    { id: 57, marca: 'Sportlife', nombre: 'Sportlife - Providencia (Pedro de Valdivia)', comuna: 'Providencia', region: 'RM', direccion: 'Av. Pedro de Valdivia 12', distancia: '3.0 km', telefono: '+56 2 2240 3304', tipo: 'Centro Deportivo', mapaQuery: 'Sportlife+Pedro+de+Valdivia+12', fechaApertura: '10/03/2018', arrendador: 'Providencia Plaza', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$32.000 CLP' },
    { id: 58, marca: 'Sportlife', nombre: 'Sportlife - Ñuñoa', comuna: 'Ñuñoa', region: 'RM', direccion: 'Av. Irarrázaval 2821', distancia: '3.9 km', telefono: '+56 2 2240 3305', tipo: 'Centro Deportivo', mapaQuery: 'Sportlife+Irarrazaval+2821', fechaApertura: '14/11/2019', arrendador: 'Plaza Irarrázaval', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$32.000 CLP' },
    { id: 59, marca: 'Sportlife', nombre: 'Sportlife - La Florida', comuna: 'La Florida', region: 'RM', direccion: 'Av. Vicuña Mackenna 7110', distancia: '9.5 km', telefono: '+56 2 2240 3306', tipo: 'Centro Deportivo', mapaQuery: 'Sportlife+Vicuna+Mackenna+7110', fechaApertura: '01/08/2020', arrendador: 'Mallplaza Vespucio', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$32.000 CLP' },

    // POWER FITNESS RM
    { id: 60, marca: 'Power Fitness', nombre: 'Power Fitness - Santiago Centro (Merced)', comuna: 'Santiago Centro', region: 'RM', direccion: 'Merced 838, piso -1 (Edificio Casa Colorada)', distancia: '3.2 km', telefono: '+56 2 2632 2001', tipo: 'Musculación y Fitness', mapaQuery: 'Power+Fitness+Merced+838', fechaApertura: '12/04/2017', arrendador: 'Edificio Casa Colorada', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$22.000 CLP' },
    { id: 61, marca: 'Power Fitness', nombre: 'Power Fitness - Santiago Centro (Chacabuco)', comuna: 'Santiago Centro', region: 'RM', direccion: 'Chacabuco 511', distancia: '4.5 km', telefono: '+56 2 2632 2002', tipo: 'Musculación y Fitness', mapaQuery: 'Power+Fitness+Chacabuco+511', fechaApertura: '10/10/2018', arrendador: 'Barrio Yungay', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$22.000 CLP' },
    { id: 62, marca: 'Power Fitness', nombre: 'Power Fitness - Santiago Centro (Carmen)', comuna: 'Santiago Centro', region: 'RM', direccion: 'Carmen 1291', distancia: '4.0 km', telefono: '+56 2 2632 2003', tipo: 'Musculación y Fitness', mapaQuery: 'Power+Fitness+Carmen+1291', fechaApertura: '05/05/2019', arrendador: 'Comercial Carmen', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$22.000 CLP' },
    { id: 63, marca: 'Power Fitness', nombre: 'Power Fitness - Santiago Centro (Lord Cochrane)', comuna: 'Santiago Centro', region: 'RM', direccion: 'Lord Cochrane 568', distancia: '3.9 km', telefono: '+56 2 2632 2004', tipo: 'Musculación y Fitness', mapaQuery: 'Power+Fitness+Lord+Cochrane+568', fechaApertura: '15/01/2020', arrendador: 'Plaza Cochrane', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$22.000 CLP' },
    { id: 64, marca: 'Power Fitness', nombre: 'Power Fitness - Ñuñoa (Irarrázaval)', comuna: 'Ñuñoa', region: 'RM', direccion: 'Av. Irarrázaval 4938', distancia: '5.2 km', telefono: '+56 2 2632 2005', tipo: 'Musculación y Fitness', mapaQuery: 'Power+Fitness+Irarrazaval+4938', fechaApertura: '01/09/2020', arrendador: 'Ñuñoa Center', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$22.000 CLP' },
    { id: 65, marca: 'Power Fitness', nombre: 'Power Fitness - Ñuñoa (Exequiel Fernández)', comuna: 'Ñuñoa', region: 'RM', direccion: 'Exequiel Fernández 653', distancia: '4.8 km', telefono: '+56 2 2632 2006', tipo: 'Musculación y Fitness', mapaQuery: 'Power+Fitness+Exequiel+Fernandez+653', fechaApertura: '12/12/2020', arrendador: 'Inmobiliaria Exequiel', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$22.000 CLP' },
    { id: 66, marca: 'Power Fitness', nombre: 'Power Fitness - Macul', comuna: 'Macul', region: 'RM', direccion: 'Av. Macul 3403', distancia: '6.1 km', telefono: '+56 2 2632 2007', tipo: 'Musculación y Fitness', mapaQuery: 'Power+Fitness+Macul+3403', fechaApertura: '08/03/2021', arrendador: 'Plaza Macul', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$22.000 CLP' },
    { id: 67, marca: 'Power Fitness', nombre: 'Power Fitness - San Bernardo', comuna: 'San Bernardo', region: 'RM', direccion: 'Av. Victoria 320', distancia: '16 km', telefono: '+56 2 2632 2008', tipo: 'Musculación y Fitness', mapaQuery: 'Power+Fitness+Victoria+320+San+Bernardo', fechaApertura: '20/07/2021', arrendador: 'San Bernardo Centro', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$22.000 CLP' },
    { id: 68, marca: 'Power Fitness', nombre: 'Power Fitness - Peñaflor (Vicuña Mackenna)', comuna: 'Peñaflor', region: 'RM', direccion: 'Av. Vicuña Mackenna 2996', distancia: '28 km', telefono: '+56 2 2632 2009', tipo: 'Musculación y Fitness', mapaQuery: 'Power+Fitness+Vicuna+Mackenna+2996+Penaflor', fechaApertura: '01/10/2021', arrendador: 'Comercial Peñaflor', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$22.000 CLP' },
    { id: 69, marca: 'Power Fitness', nombre: 'Power Fitness - Peñaflor (Miraflores)', comuna: 'Peñaflor', region: 'RM', direccion: 'Miraflores 936', distancia: '29 km', telefono: '+56 2 2632 2010', tipo: 'Musculación y Fitness', mapaQuery: 'Power+Fitness+Miraflores+936+Penaflor', fechaApertura: '15/02/2022', arrendador: 'Miraflores Plaza', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$22.000 CLP' },
    { id: 70, marca: 'Power Fitness', nombre: 'Power Fitness - Talagante', comuna: 'Talagante', region: 'RM', direccion: 'Lucas Pacheco 869', distancia: '35 km', telefono: '+56 2 2632 2011', tipo: 'Musculación y Fitness', mapaQuery: 'Power+Fitness+Lucas+Pacheco+869+Talagante', fechaApertura: '10/06/2022', arrendador: 'Pacheco Center', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$22.000 CLP' },
    { id: 71, marca: 'Power Fitness', nombre: 'Power Fitness - El Monte', comuna: 'El Monte', region: 'RM', direccion: 'Av. Los Libertadores 581', distancia: '42 km', telefono: '+56 2 2632 2012', tipo: 'Musculación y Fitness', mapaQuery: 'Power+Fitness+Los+Libertadores+581+El+Monte', fechaApertura: '05/11/2022', arrendador: 'El Monte Plaza', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$22.000 CLP' },
    { id: 72, marca: 'Power Fitness', nombre: 'Power Fitness - Padre Hurtado', comuna: 'Padre Hurtado', region: 'RM', direccion: 'Camino a Melipilla 2830', distancia: '22 km', telefono: '+56 2 2632 2013', tipo: 'Musculación y Fitness', mapaQuery: 'Power+Fitness+Camino+a+Melipilla+2830', fechaApertura: '18/01/2023', arrendador: 'Paseo Padre Hurtado', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$22.000 CLP' },
    { id: 73, marca: 'Power Fitness', nombre: 'Power Fitness - Bollenar (Melipilla)', comuna: 'Melipilla / Bollenar', region: 'RM', direccion: 'Anselmo Alarcón 1232', distancia: '55 km', telefono: '+56 2 2632 2014', tipo: 'Musculación y Fitness', mapaQuery: 'Power+Fitness+Bollenar+Melipilla', fechaApertura: '22/04/2023', arrendador: 'Comercial Bollenar', horarioApertura: '06:30 - 22:00 hrs', costoMatricula: '$22.000 CLP' },

    // O2 FIT RM
    { id: 74, marca: 'O2 Fit', nombre: 'O2 Fit - El Golf (Las Condes)', comuna: 'Las Condes', region: 'RM', direccion: 'Av. Isidora Goyenechea 3000, Nivel 3', distancia: '2.5 km', telefono: '+56 2 2340 5001', tipo: 'Gimnasio Premium', mapaQuery: 'O2+Fit+Isidora+Goyenechea+3000', fechaApertura: '10/05/2014', arrendador: 'Edificio El Golf', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$45.000 CLP' },
    { id: 75, marca: 'O2 Fit', nombre: 'O2 Fit - Kennedy (Las Condes)', comuna: 'Las Condes', region: 'RM', direccion: 'Av. Presidente Kennedy 5413', distancia: '3.2 km', telefono: '+56 2 2340 5002', tipo: 'Gimnasio Premium', mapaQuery: 'O2+Fit+Kennedy+5413', fechaApertura: '18/11/2016', arrendador: 'Parque Arauco', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$45.000 CLP' },
    { id: 76, marca: 'O2 Fit', nombre: 'O2 Fit - San Carlos de Apoquindo (Lo Barnechea)', comuna: 'Lo Barnechea', region: 'RM', direccion: 'Camino El Alba 12607', distancia: '7.8 km', telefono: '+56 2 2340 5003', tipo: 'Gimnasio Premium', mapaQuery: 'O2+Fit+Camino+El+Alba+12607', fechaApertura: '04/08/2018', arrendador: 'San Carlos Center', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$45.000 CLP' },

    // ANYTIME FITNESS RM
    { id: 77, marca: 'Anytime Fitness', nombre: 'Anytime Fitness - Chicureo (Colina)', comuna: 'Colina / Chicureo', region: 'RM', direccion: 'Av. Chicureo 1700, Colina', distancia: '22 km', telefono: '+56 9 7777 8801', tipo: 'Gimnasio 24/7', mapaQuery: 'Anytime+Fitness+Chicureo+1700', fechaApertura: '12/01/2020', arrendador: 'Chicureo Plaza', horarioApertura: '24 Horas / Continuo', costoMatricula: '$34.990 CLP' },
    { id: 78, marca: 'Anytime Fitness', nombre: 'Anytime Fitness - Lo Barnechea (La Dehesa)', comuna: 'Lo Barnechea', region: 'RM', direccion: 'Av. José Alcalde Délano 10581, Lo Barnechea', distancia: '8.5 km', telefono: '+56 9 7777 8802', tipo: 'Gimnasio 24/7', mapaQuery: 'Anytime+Fitness+Alcalde+Delano+10581', fechaApertura: '15/06/2020', arrendador: 'La Dehesa Center', horarioApertura: '24 Horas / Continuo', costoMatricula: '$34.990 CLP' },
    { id: 79, marca: 'Anytime Fitness', nombre: 'Anytime Fitness - Vitacura', comuna: 'Vitacura', region: 'RM', direccion: 'Av. Vitacura 5028', distancia: '4.8 km', telefono: '+56 9 7777 8803', tipo: 'Gimnasio 24/7', mapaQuery: 'Anytime+Fitness+Vitacura+5028', fechaApertura: '10/11/2020', arrendador: 'Vitacura Strip', horarioApertura: '24 Horas / Continuo', costoMatricula: '$34.990 CLP' },
    { id: 80, marca: 'Anytime Fitness', nombre: 'Anytime Fitness - Las Condes', comuna: 'Las Condes', region: 'RM', direccion: 'Av. Apoquindo 6410', distancia: '2.1 km', telefono: '+56 9 7777 8804', tipo: 'Gimnasio 24/7', mapaQuery: 'Anytime+Fitness+Apoquindo+6410', fechaApertura: '05/03/2021', arrendador: 'Apoquindo Plaza', horarioApertura: '24 Horas / Continuo', costoMatricula: '$34.990 CLP' },

    // SPEEDWORKS / YOUTOPIA / DMOOV RM
    { id: 81, marca: 'SpeedWorks', nombre: 'SpeedWorks - Las Condes (Cerro Colorado)', comuna: 'Las Condes', region: 'RM', direccion: 'Cerro Colorado 4661', distancia: '3.0 km', telefono: '+56 9 9584 1701', tipo: 'Entrenamiento Funcional', mapaQuery: 'SpeedWorks+Cerro+Colorado+4661', fechaApertura: '18/05/2017', arrendador: 'Sport Management', horarioApertura: '06:00 - 21:30 hrs', costoMatricula: '$40.000 CLP' },
    { id: 82, marca: 'SpeedWorks', nombre: 'SpeedWorks - Las Condes (Kennedy Estoril)', comuna: 'Las Condes', region: 'RM', direccion: 'Av. Presidente Kennedy 9351', distancia: '4.5 km', telefono: '+56 9 9584 1702', tipo: 'Entrenamiento Funcional', mapaQuery: 'SpeedWorks+Kennedy+9351', fechaApertura: '10/10/2018', arrendador: 'Estoril Center', horarioApertura: '06:00 - 21:30 hrs', costoMatricula: '$40.000 CLP' },
    { id: 83, marca: 'SpeedWorks', nombre: 'SpeedWorks - La Florida', comuna: 'La Florida', region: 'RM', direccion: 'Enrique Olivares 857', distancia: '11 km', telefono: '+56 9 9584 1703', tipo: 'Entrenamiento Funcional', mapaQuery: 'SpeedWorks+Enrique+Olivares+857', fechaApertura: '15/04/2021', arrendador: 'Deportes La Florida', horarioApertura: '06:00 - 21:30 hrs', costoMatricula: '$40.000 CLP' },
    { id: 84, marca: 'Youtopia', nombre: 'Youtopia - Los Trapenses (Lo Barnechea)', comuna: 'Lo Barnechea', region: 'RM', direccion: 'Av. José Alcalde Délano 10497 (Mall VIVO Los Trapenses)', distancia: '8.8 km', telefono: '+56 2 2951 8001', tipo: 'Club Deportivo Premium', mapaQuery: 'Youtopia+Los+Trapenses', fechaApertura: '01/03/2016', arrendador: 'Mall VIVO Los Trapenses', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$120.000 CLP' },
    { id: 85, marca: 'Youtopia', nombre: 'Youtopia - Vitacura', comuna: 'Vitacura', region: 'RM', direccion: 'Av. José María Escrivá de Balaguer 5800', distancia: '5.2 km', telefono: '+56 2 2951 8002', tipo: 'Club Deportivo Premium', mapaQuery: 'Youtopia+Escriva+de+Balaguer+5800', fechaApertura: '12/11/2019', arrendador: 'Escrivá Center', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$120.000 CLP' },
    { id: 86, marca: 'Dmoov', nombre: 'Dmoov - Las Condes (Escuela Militar)', comuna: 'Las Condes', region: 'RM', direccion: 'Av. Apoquindo 4501, Local 6', distancia: '1.2 km', telefono: '+56 2 2843 1201', tipo: 'Club Fitness', mapaQuery: 'Dmoov+Apoquindo+4501', fechaApertura: '10/10/2019', arrendador: 'Escuela Militar Mall', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$38.000 CLP' },
    { id: 87, marca: 'Dmoov', nombre: 'Dmoov - Chicureo (Colina)', comuna: 'Colina / Chicureo', region: 'RM', direccion: 'Av. Del Valle 12810', distancia: '21 km', telefono: '+56 2 2843 1202', tipo: 'Club Fitness', mapaQuery: 'Dmoov+Del+Valle+12810+Chicureo', fechaApertura: '05/05/2021', arrendador: 'Chicureo Plaza', horarioApertura: '06:00 - 22:00 hrs', costoMatricula: '$38.000 CLP' },

    // SMART FIT RM COMPLETO POR SECTORES
    { id: 88, marca: 'Smart Fit', nombre: 'Smart Fit - Santiago Centro (Imperio)', comuna: 'Santiago Centro', region: 'RM', direccion: 'Huérfanos 830, Nivel Terrazas', distancia: '3.5 km', telefono: '+56 9 8765 4001', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Huerfanos+830', fechaApertura: '10/08/2018', arrendador: 'Galería Imperio', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 89, marca: 'Smart Fit', nombre: 'Smart Fit - Santiago Centro (Espacio M)', comuna: 'Santiago Centro', region: 'RM', direccion: 'Compañía de Jesús 1214', distancia: '3.6 km', telefono: '+56 9 8765 4002', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Compania+1214', fechaApertura: '12/03/2019', arrendador: 'Espacio M', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 90, marca: 'Smart Fit', nombre: 'Smart Fit - Santiago Centro (Vivo El Centro)', comuna: 'Santiago Centro', region: 'RM', direccion: 'Puente 689', distancia: '3.7 km', telefono: '+56 9 8765 4003', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Puente+689+Santiago', fechaApertura: '15/05/2019', arrendador: 'Vivo El Centro', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 91, marca: 'Smart Fit', nombre: 'Smart Fit - Santiago Centro (Catedral)', comuna: 'Santiago Centro', region: 'RM', direccion: 'Catedral 1410', distancia: '3.8 km', telefono: '+56 9 8765 4004', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Catedral+1410', fechaApertura: '10/01/2020', arrendador: 'Centro Catedral', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 92, marca: 'Smart Fit', nombre: 'Smart Fit - Santiago Centro (Santa Rosa)', comuna: 'Santiago Centro', region: 'RM', direccion: 'Av. Libertador Bernardo O\'Higgins 632-678', distancia: '3.2 km', telefono: '+56 9 8765 4005', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Alameda+Santa+Rosa', fechaApertura: '22/04/2020', arrendador: 'Alameda Center', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 93, marca: 'Smart Fit', nombre: 'Smart Fit - Santiago Centro (San Diego 227)', comuna: 'Santiago Centro', region: 'RM', direccion: 'San Diego 227', distancia: '3.9 km', telefono: '+56 9 8765 4006', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+San+Diego+227', fechaApertura: '18/09/2020', arrendador: 'Paseo San Diego', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 94, marca: 'Smart Fit', nombre: 'Smart Fit - Santiago Centro (Portugal)', comuna: 'Santiago Centro', region: 'RM', direccion: 'Portugal 614', distancia: '3.1 km', telefono: '+56 9 8765 4007', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Portugal+614', fechaApertura: '01/12/2020', arrendador: 'Plaza Portugal', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 95, marca: 'Smart Fit', nombre: 'Smart Fit - Santiago Centro (Núcleo San Diego)', comuna: 'Santiago Centro', region: 'RM', direccion: 'Ñuble 1055, Piso 4', distancia: '4.5 km', telefono: '+56 9 8765 4008', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Nuble+1055', fechaApertura: '15/03/2021', arrendador: 'Núcleo San Diego', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 96, marca: 'Smart Fit', nombre: 'Smart Fit - Santiago Centro (Plaza Franklin)', comuna: 'Santiago Centro', region: 'RM', direccion: 'San Diego 2320', distancia: '5.2 km', telefono: '+56 9 8765 4009', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+San+Diego+2320', fechaApertura: '10/08/2021', arrendador: 'Plaza Franklin', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 97, marca: 'Smart Fit', nombre: 'Smart Fit - Santiago Centro (Grajales)', comuna: 'Santiago Centro', region: 'RM', direccion: 'Grajales 2820', distancia: '5.0 km', telefono: '+56 9 8765 4010', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Grajales+2820', fechaApertura: '05/11/2021', arrendador: 'Grajales Center', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 98, marca: 'Smart Fit', nombre: 'Smart Fit - Providencia (Bilbao)', comuna: 'Providencia', region: 'RM', direccion: 'Av. Francisco Bilbao 0102', distancia: '2.5 km', telefono: '+56 9 8765 4011', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Francisco+Bilbao+0102', fechaApertura: '12/01/2019', arrendador: 'Bilbao Center', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 99, marca: 'Smart Fit', nombre: 'Smart Fit - Providencia (Tobalaba)', comuna: 'Providencia', region: 'RM', direccion: 'Av. Providencia 2563, Locales 13 y 14', distancia: '1.8 km', telefono: '+56 9 8765 4012', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Providencia+2563', fechaApertura: '15/07/2019', arrendador: 'Paseo Tobalaba', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 100, marca: 'Smart Fit', nombre: 'Smart Fit - Providencia (Vivo Panorámico)', comuna: 'Providencia', region: 'RM', direccion: 'Av. Ricardo Lyon 157', distancia: '1.9 km', telefono: '+56 9 8765 4013', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Ricardo+Lyon+157', fechaApertura: '20/11/2019', arrendador: 'Vivo Panorámico', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 101, marca: 'Smart Fit', nombre: 'Smart Fit - Providencia (Almirante Pastene)', comuna: 'Providencia', region: 'RM', direccion: 'Almirante Pastene 92', distancia: '2.2 km', telefono: '+56 9 8765 4014', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Almirante+Pastene+92', fechaApertura: '10/02/2020', arrendador: 'Pastene Plaza', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 102, marca: 'Smart Fit', nombre: 'Smart Fit - Las Condes (Apumanque / Foster)', comuna: 'Las Condes', region: 'RM', direccion: 'Av. Apoquindo 3472', distancia: '1.0 km', telefono: '+56 9 8765 4015', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Apoquindo+3472', fechaApertura: '11/02/2020', arrendador: 'Apumanque Center', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 103, marca: 'Smart Fit', nombre: 'Smart Fit - Las Condes (Escuela Militar)', comuna: 'Las Condes', region: 'RM', direccion: 'Av. Apoquindo 4501', distancia: '1.2 km', telefono: '+56 9 8765 4016', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Apoquindo+4501', fechaApertura: '01/06/2017', arrendador: 'Apoquindo Center', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 104, marca: 'Smart Fit', nombre: 'Smart Fit - Las Condes (Parque Titanium)', comuna: 'Las Condes', region: 'RM', direccion: 'Av. Costanera Sur 2710', distancia: '2.0 km', telefono: '+56 9 8765 4017', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Costanera+Sur+2710', fechaApertura: '18/06/2018', arrendador: 'Parque Titanium', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 105, marca: 'Smart Fit', nombre: 'Smart Fit - Las Condes (Nueva Las Condes)', comuna: 'Las Condes', region: 'RM', direccion: 'Rosario Norte 555', distancia: '1.5 km', telefono: '+56 9 8765 4018', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Rosario+Norte+555', fechaApertura: '18/08/2020', arrendador: 'Edificio Nueva Las Condes', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 106, marca: 'Smart Fit', nombre: 'Smart Fit - Las Condes (Isabel La Católica)', comuna: 'Las Condes', region: 'RM', direccion: 'Av. Isabel La Católica 4350', distancia: '2.8 km', telefono: '+56 9 8765 4019', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Isabel+La+Catolica+4350', fechaApertura: '10/01/2021', arrendador: 'Isabel Center', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 107, marca: 'Smart Fit', nombre: 'Smart Fit - Vitacura', comuna: 'Vitacura', region: 'RM', direccion: 'Av. Américo Vespucio 1561, Local 001', distancia: '4.0 km', telefono: '+56 9 8765 4020', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Americo+Vespucio+1561', fechaApertura: '15/05/2019', arrendador: 'Vespucio Strip', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 108, marca: 'Smart Fit', nombre: 'Smart Fit - Lo Barnechea (Portal La Dehesa)', comuna: 'Lo Barnechea', region: 'RM', direccion: 'Av. La Dehesa 1445', distancia: '8.5 km', telefono: '+56 9 8765 4021', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Portal+La+Dehesa', fechaApertura: '12/09/2019', arrendador: 'Cencosud Portal La Dehesa', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 109, marca: 'Smart Fit', nombre: 'Smart Fit - La Reina', comuna: 'La Reina', region: 'RM', direccion: 'Av. Jorge Alessandri 1131, Local 13', distancia: '6.0 km', telefono: '+56 9 8765 4022', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Jorge+Alessandri+1131', fechaApertura: '01/12/2019', arrendador: 'Alessandri Plaza', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 110, marca: 'Smart Fit', nombre: 'Smart Fit - Ñuñoa (Portal Ñuñoa)', comuna: 'Ñuñoa', region: 'RM', direccion: 'Av. José Pedro Alessandri 1166, Local 3061', distancia: '4.2 km', telefono: '+56 9 8765 4023', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Portal+Nunoa', fechaApertura: '10/12/2020', arrendador: 'Cencosud Portal Ñuñoa', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 111, marca: 'Smart Fit', nombre: 'Smart Fit - Ñuñoa (Irarrázaval)', comuna: 'Ñuñoa', region: 'RM', direccion: 'Av. Irarrázaval 2401', distancia: '3.8 km', telefono: '+56 9 8765 4024', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Irarrazaval+2401', fechaApertura: '05/03/2021', arrendador: 'Irarrázaval Plaza', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 112, marca: 'Smart Fit', nombre: 'Smart Fit - Peñalolén (Lider Quilín)', comuna: 'Peñalolén', region: 'RM', direccion: 'Av. Américo Vespucio 3100', distancia: '7.0 km', telefono: '+56 9 8765 4025', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Americo+Vespucio+3100', fechaApertura: '18/07/2020', arrendador: 'Walmart Lider Quilín', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 113, marca: 'Smart Fit', nombre: 'Smart Fit - Peñalolén (Open Tobalaba)', comuna: 'Peñalolén', region: 'RM', direccion: 'Av. Tobalaba 11201', distancia: '7.8 km', telefono: '+56 9 8765 4026', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Tobalaba+11201', fechaApertura: '20/11/2020', arrendador: 'Open Plaza Tobalaba', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 114, marca: 'Smart Fit', nombre: 'Smart Fit - Peñalolén (Altos del Parque)', comuna: 'Peñalolén', region: 'RM', direccion: 'Altos del Parque Sur 5800, Piso 2', distancia: '8.2 km', telefono: '+56 9 8765 4027', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Altos+del+Parque+Sur+5800', fechaApertura: '12/04/2022', arrendador: 'Altos Center', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 115, marca: 'Smart Fit', nombre: 'Smart Fit - San Miguel (Puerto El Llano)', comuna: 'San Miguel', region: 'RM', direccion: 'Gran Av. José Miguel Carrera 2670', distancia: '7.5 km', telefono: '+56 9 8765 4028', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Gran+Avenida+2670', fechaApertura: '10/01/2019', arrendador: 'Puerto El Llano', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 116, marca: 'Smart Fit', nombre: 'Smart Fit - San Miguel (Puerto San Miguel)', comuna: 'San Miguel', region: 'RM', direccion: 'Gran Av. José Miguel Carrera 5553, Locales 1 y 2', distancia: '8.8 km', telefono: '+56 9 8765 4029', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Gran+Avenida+5553', fechaApertura: '15/09/2020', arrendador: 'Puerto San Miguel', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 117, marca: 'Smart Fit', nombre: 'Smart Fit - San Miguel (Lo Ovalle)', comuna: 'San Miguel', region: 'RM', direccion: 'Gran Av. José Miguel Carrera 6178', distancia: '9.2 km', telefono: '+56 9 8765 4030', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Gran+Avenida+6178', fechaApertura: '22/02/2021', arrendador: 'Lo Ovalle Center', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 118, marca: 'Smart Fit', nombre: 'Smart Fit - Pedro Aguirre Cerda (Núcleo Ochagavía)', comuna: 'Pedro Aguirre Cerda', region: 'RM', direccion: 'Club Hípico 4676, Local 29', distancia: '8.0 km', telefono: '+56 9 8765 4031', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Club+Hipico+4676', fechaApertura: '11/11/2020', arrendador: 'Núcleo Ochagavía', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 119, marca: 'Smart Fit', nombre: 'Smart Fit - La Florida (Mallplaza Vespucio)', comuna: 'La Florida', region: 'RM', direccion: 'Av. Vicuña Mackenna 7110', distancia: '9.5 km', telefono: '+56 9 8765 4032', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Mallplaza+Vespucio', fechaApertura: '14/03/2021', arrendador: 'Mallplaza', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 120, marca: 'Smart Fit', nombre: 'Smart Fit - La Florida (Florida Center)', comuna: 'La Florida', region: 'RM', direccion: 'Av. Vicuña Mackenna 6100, Local 3009', distancia: '9.0 km', telefono: '+56 9 8765 4033', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Florida+Center', fechaApertura: '10/08/2018', arrendador: 'Cencosud Florida Center', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 121, marca: 'Smart Fit', nombre: 'Smart Fit - La Florida (Lider Departamental)', comuna: 'La Florida', region: 'RM', direccion: 'Av. Américo Vespucio 6325', distancia: '8.8 km', telefono: '+56 9 8765 4034', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Americo+Vespucio+6325', fechaApertura: '05/05/2019', arrendador: 'Walmart Lider', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 122, marca: 'Smart Fit', nombre: 'Smart Fit - La Florida (Open Macul)', comuna: 'La Florida', region: 'RM', direccion: 'Av. La Florida 6400', distancia: '9.2 km', telefono: '+56 9 8765 4035', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Av+La+Florida+6400', fechaApertura: '12/10/2019', arrendador: 'Open Plaza Macul', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 123, marca: 'Smart Fit', nombre: 'Smart Fit - La Florida (Walker Martínez)', comuna: 'La Florida', region: 'RM', direccion: 'Walker Martínez 3600, Nivel 2', distancia: '9.8 km', telefono: '+56 9 8765 4036', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Walker+Martinez+3600', fechaApertura: '18/01/2020', arrendador: 'Walker Strip Center', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 124, marca: 'Smart Fit', nombre: 'Smart Fit - La Florida (Lider Santa Amalia)', comuna: 'La Florida', region: 'RM', direccion: 'Av. Santa Amalia 1765', distancia: '10.5 km', telefono: '+56 9 8765 4037', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Santa+Amalia+1765', fechaApertura: '15/06/2021', arrendador: 'Walmart Lider', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 125, marca: 'Smart Fit', nombre: 'Smart Fit - La Florida (Outlet La Florida / Sótero del Río)', comuna: 'La Florida', region: 'RM', direccion: 'Av. La Florida 8988', distancia: '11.2 km', telefono: '+56 9 8765 4038', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Av+La+Florida+8988', fechaApertura: '01/12/2021', arrendador: 'Outlet La Florida', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 126, marca: 'Smart Fit', nombre: 'Smart Fit - Puente Alto (Plaza Puente Alto)', comuna: 'Puente Alto', region: 'RM', direccion: 'Concha y Toro 26', distancia: '18 km', telefono: '+56 9 8765 4039', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Concha+y+Toro+26', fechaApertura: '10/04/2018', arrendador: 'Plaza Puente Alto', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 127, marca: 'Smart Fit', nombre: 'Smart Fit - Puente Alto (Ciudad del Este)', comuna: 'Puente Alto', region: 'RM', direccion: 'Av. Diego Portales 6372', distancia: '16 km', telefono: '+56 9 8765 4040', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Diego+Portales+6372', fechaApertura: '15/09/2020', arrendador: 'Ciudad del Este Mall', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 128, marca: 'Smart Fit', nombre: 'Smart Fit - San Bernardo (Centro)', comuna: 'San Bernardo', region: 'RM', direccion: 'Eyzaguirre 650', distancia: '20 km', telefono: '+56 9 8765 4041', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Eyzaguirre+650', fechaApertura: '05/03/2019', arrendador: 'Paseo Eyzaguirre', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 129, marca: 'Smart Fit', nombre: 'Smart Fit - San Bernardo (Mall Plaza Sur)', comuna: 'San Bernardo', region: 'RM', direccion: 'Av. Jorge Alessandri Rodríguez 20040', distancia: '22 km', telefono: '+56 9 8765 4042', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Mall+Plaza+Sur+San+Bernardo', fechaApertura: '12/01/2022', arrendador: 'Mallplaza Sur', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 130, marca: 'Smart Fit', nombre: 'Smart Fit - Estación Central (Borja)', comuna: 'Estación Central', region: 'RM', direccion: 'San Francisco de Borja 84, Tercer Nivel', distancia: '6.0 km', telefono: '+56 9 8765 4043', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+San+Francisco+de+Borja+84', fechaApertura: '14/06/2018', arrendador: 'Paseo Borja', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 131, marca: 'Smart Fit', nombre: 'Smart Fit - Estación Central (Mall Plaza Alameda)', comuna: 'Estación Central', region: 'RM', direccion: 'Av. Libertador Bernardo O\'Higgins 3470', distancia: '6.5 km', telefono: '+56 9 8765 4044', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Mall+Plaza+Alameda', fechaApertura: '10/11/2019', arrendador: 'Mallplaza Alameda', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 132, marca: 'Smart Fit', nombre: 'Smart Fit - Cerrillos (Oeste)', comuna: 'Cerrillos', region: 'RM', direccion: 'Av. Américo Vespucio 2500, Local 13', distancia: '12 km', telefono: '+56 9 8765 4045', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Americo+Vespucio+2500', fechaApertura: '18/02/2020', arrendador: 'Paseo Vespucio', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 133, marca: 'Smart Fit', nombre: 'Smart Fit - Cerrillos (Mallplaza Oeste)', comuna: 'Cerrillos', region: 'RM', direccion: 'Av. Américo Vespucio 1501', distancia: '12.5 km', telefono: '+56 9 8765 4046', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Mallplaza+Oeste', fechaApertura: '01/08/2017', arrendador: 'Mallplaza Oeste', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 134, marca: 'Smart Fit', nombre: 'Smart Fit - Maipú (Central)', comuna: 'Maipú', region: 'RM', direccion: 'Av. Pajaritos 2689, Local 14', distancia: '14 km', telefono: '+56 9 8765 4047', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Pajaritos+2689', fechaApertura: '10/05/2021', arrendador: 'Pajaritos Center', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 135, marca: 'Smart Fit', nombre: 'Smart Fit - Maipú (City Point)', comuna: 'Maipú', region: 'RM', direccion: 'Av. Los Pajaritos 1948', distancia: '14.5 km', telefono: '+56 9 8765 4048', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Los+Pajaritos+1948', fechaApertura: '05/09/2021', arrendador: 'City Point Maipú', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 136, marca: 'Smart Fit', nombre: 'Smart Fit - Maipú (Rinconada)', comuna: 'Maipú', region: 'RM', direccion: 'Av. Rinconada 1120', distancia: '16 km', telefono: '+56 9 8765 4049', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Rinconada+1120', fechaApertura: '12/12/2022', arrendador: 'Rinconada Mall', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 137, marca: 'Smart Fit', nombre: 'Smart Fit - Pudahuel (Laguna Sur)', comuna: 'Pudahuel', region: 'RM', direccion: 'Av. Laguna Sur 8501', distancia: '15 km', telefono: '+56 9 8765 4050', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Laguna+Sur+8501', fechaApertura: '20/03/2022', arrendador: 'Laguna Sur Center', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 138, marca: 'Smart Fit', nombre: 'Smart Fit - Huechuraba (Ciudad Empresarial)', comuna: 'Huechuraba', region: 'RM', direccion: 'Av. Del Parque 4722', distancia: '8.5 km', telefono: '+56 9 8765 4051', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Del+Parque+4722', fechaApertura: '10/06/2018', arrendador: 'Ciudad Empresarial', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 139, marca: 'Smart Fit', nombre: 'Smart Fit - Recoleta (Lider Recoleta)', comuna: 'Recoleta', region: 'RM', direccion: 'Av. Recoleta 3501', distancia: '8.0 km', telefono: '+56 9 8765 4052', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Av+Recoleta+3501', fechaApertura: '15/11/2019', arrendador: 'Walmart Lider', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 140, marca: 'Smart Fit', nombre: 'Smart Fit - Recoleta (Núcleo Recoleta)', comuna: 'Recoleta', region: 'RM', direccion: 'Av. Recoleta 662', distancia: '5.2 km', telefono: '+56 9 8765 4053', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Av+Recoleta+662', fechaApertura: '01/04/2021', arrendador: 'Núcleo Recoleta', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 141, marca: 'Smart Fit', nombre: 'Smart Fit - Independencia (Mall Barrio Independencia)', comuna: 'Independencia', region: 'RM', direccion: 'Av. Independencia 565', distancia: '5.0 km', telefono: '+56 9 8765 4054', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Mall+Barrio+Independencia', fechaApertura: '10/09/2018', arrendador: 'Mall Barrio Independencia', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 142, marca: 'Smart Fit', nombre: 'Smart Fit - Quilicura (Lo Cruzat)', comuna: 'Quilicura', region: 'RM', direccion: 'Av. Lo Cruzat 0446', distancia: '16 km', telefono: '+56 9 8765 4055', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Lo+Cruzat+0446', fechaApertura: '12/10/2021', arrendador: 'Lo Cruzat Center', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 143, marca: 'Smart Fit', nombre: 'Smart Fit - Colina (Chicureo)', comuna: 'Colina / Chicureo', region: 'RM', direccion: 'Av. Chicureo 2300', distancia: '23 km', telefono: '+56 9 8765 4056', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Chicureo+2300', fechaApertura: '18/05/2020', arrendador: 'Chicureo Mall', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 144, marca: 'Smart Fit', nombre: 'Smart Fit - Talagante', comuna: 'Talagante', region: 'RM', direccion: 'Av. Bernardo O\'Higgins 1360', distancia: '36 km', telefono: '+56 9 8765 4057', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Bernardo+OHiggins+1360+Talagante', fechaApertura: '05/01/2022', arrendador: 'Paseo Talagante', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' },
    { id: 145, marca: 'Smart Fit', nombre: 'Smart Fit - Melipilla (Espacio Urbano)', comuna: 'Melipilla', region: 'RM', direccion: 'Av. Vicuña Mackenna 080', distancia: '60 km', telefono: '+56 9 8765 4058', tipo: 'Cadena Internacional', mapaQuery: 'Smart+Fit+Espacio+Urbano+Melipilla', fechaApertura: '10/08/2022', arrendador: 'Espacio Urbano Melipilla', horarioApertura: '06:00 - 22:30 hrs', costoMatricula: '$29.990 CLP' }
  ];

  const [selectedGym, setSelectedGym] = useState(gimnasiosChile[47]);

  // Cálculo dinámico de marcas y regiones para selectores
  const marcasDisponibles = ['todas', ...Array.from(new Set(gimnasiosChile.map(g => g.marca)))];
  const regionesDisponibles = ['todas', ...Array.from(new Set(gimnasiosChile.map(g => g.region)))];

  // Filtro inteligente multiplataforma
  const gimnasiosFiltrados = gimnasiosChile.filter(gym => {
    const coincideTexto = 
      gym.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gym.direccion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gym.comuna.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gym.marca.toLowerCase().includes(searchQuery.toLowerCase());

    const coincideRegion = filterRegion === 'todas' || gym.region === filterRegion;
    const coincideMarca = filterMarca === 'todas' || gym.marca === filterMarca;

    return coincideTexto && coincideRegion && coincideMarca;
  });

  // Generador de mapas dinámicos en vivo
  const obtenerUrlMapa = () => {
    if (searchQuery.trim().length > 3 && gimnasiosFiltrados.length === 0) {
      return `https://www.google.com/maps?q=gimnasios+${encodeURIComponent(searchQuery)}+Chile&output=embed`;
    }
    if (selectedGym) {
      return `https://www.google.com/maps?q=${selectedGym.mapaQuery}&output=embed`;
    }
    return `https://www.google.com/maps?q=Gimnasios+en+Chile&output=embed`;
  };

  return (
    <div style={{
      fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
      backgroundColor: '#0F172A',
      color: '#F8FAFC',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* NAVBAR NAVEGACIÓN COMPLETA */}
      <header style={{ 
        backgroundColor: '#1E293B', 
        borderBottom: '1px solid #334155', 
        padding: '1rem 3rem',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <button 
              onClick={() => onNavigate && onNavigate('home')}
              style={{
                backgroundColor: 'transparent',
                color: '#00FF87',
                border: '1px solid #00FF87',
                padding: '0.5rem 1.1rem',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              ← Volver al Inicio
            </button>

            <div onClick={() => onNavigate && onNavigate('home')} style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer' }}>
              <BiometraLogoIcon />
              <span style={{ fontSize: '1.6rem', fontWeight: '900', color: '#FFFFFF' }}>BIOMETRA</span>
            </div>
          </div>

          <nav style={{ display: 'flex', alignItems: 'center', gap: '1.8rem' }}>
            <button onClick={() => onNavigate && onNavigate('home')} style={{ backgroundColor: '#00FF87', color: '#0F172A', padding: '0.55rem 1.2rem', borderRadius: '8px', fontWeight: '800', border: 'none', cursor: 'pointer' }}>
              Inicio
            </button>
            <button onClick={() => onNavigate && onNavigate('ejercicios')} style={{ background: 'none', border: 'none', color: '#CBD5E1', fontSize: '0.95rem', cursor: 'pointer', fontWeight: '600' }}>
              Ejercicios
            </button>
            <button onClick={() => onNavigate && onNavigate('perfil')} style={{ backgroundColor: '#38BDF8', color: '#0F172A', padding: '0.55rem 1.2rem', borderRadius: '20px', fontWeight: '700', border: 'none', cursor: 'pointer' }}>
              👤 Mi Perfil
            </button>
          </nav>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL Y MAPA */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', width: '100%', padding: '2.5rem 2rem', boxSizing: 'border-box' }}>
        
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2.2rem', fontWeight: '900', color: '#FFFFFF', margin: '0 0 0.4rem 0' }}>
            🏋️ Red Nacional Completa de Gimnasios en Chile
          </h2>
          <p style={{ color: '#94A3B8', fontSize: '1rem', margin: 0 }}>
            Visualiza todas las sedes, cadenas y ciudades de Chile. Escribe cualquier comuna o calle en la barra para explorar gimnasios en tiempo real.
          </p>
        </div>

        {/* ESTRUCTURA BÚSQUEDA + MAPA */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '2rem', alignItems: 'start' }}>
          
          {/* BÚSQUEDA Y LISTA DE RESULTADOS */}
          <div style={{ backgroundColor: '#1E293B', borderRadius: '16px', padding: '2rem', border: '1px solid #334155', boxShadow: '0 10px 30px rgba(0,0,0,0.3)' }}>
            <h3 style={{ margin: '0 0 1.2rem 0', color: '#38BDF8', fontSize: '1.2rem', fontWeight: '800' }}>
              🔎 Buscador por Ciudad, Marca o Comuna
            </h3>

            <input 
              type="text" 
              placeholder="Ej: Merced, Arica, Temuco, Power Fitness, Smart Fit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.9rem',
                fontSize: '0.95rem',
                borderRadius: '8px',
                border: '1px solid #334155',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                marginBottom: '1rem',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />

            {/* SELECTORES DESPLEGABLES */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '0.4rem', fontWeight: '700' }}>
                  REGIÓN DE CHILE:
                </label>
                <select
                  value={filterRegion}
                  onChange={(e) => setFilterRegion(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', backgroundColor: '#0F172A', color: '#FFFFFF', border: '1px solid #334155', fontWeight: '600', outline: 'none' }}
                >
                  {regionesDisponibles.map(r => (
                    <option key={r} value={r}>{r === 'todas' ? 'Todas las Regiones' : r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', color: '#94A3B8', display: 'block', marginBottom: '0.4rem', fontWeight: '700' }}>
                  CADENA / MARCA:
                </label>
                <select
                  value={filterMarca}
                  onChange={(e) => setFilterMarca(e.target.value)}
                  style={{ width: '100%', padding: '0.6rem', borderRadius: '8px', backgroundColor: '#0F172A', color: '#FFFFFF', border: '1px solid #334155', fontWeight: '600', outline: 'none' }}
                >
                  {marcasDisponibles.map(m => (
                    <option key={m} value={m}>{m === 'todas' ? 'Todas las Marcas' : m}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ fontSize: '0.85rem', color: '#94A3B8', marginBottom: '1rem', fontWeight: '600' }}>
              Sedes encontradas: {gimnasiosFiltrados.length}
            </div>

            {/* TARJETAS DE RESULTADOS */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '480px', overflowY: 'auto' }}>
              {gimnasiosFiltrados.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: '#0F172A', borderRadius: '12px', border: '1px dashed #334155' }}>
                  <p style={{ color: '#00FF87', fontWeight: '800', margin: '0 0 0.5rem 0' }}>🗺️ Buscando directo en el Mapa Google</p>
                  <p style={{ color: '#94A3B8', fontSize: '0.85rem', margin: 0 }}>
                    El mapa a la derecha está localizando automáticamente todos los gimnasios disponibles en "<strong>{searchQuery}</strong>".
                  </p>
                </div>
              ) : (
                gimnasiosFiltrados.map((gym) => (
                  <div 
                    key={gym.id}
                    onClick={() => setSelectedGym(gym)}
                    style={{
                      backgroundColor: selectedGym?.id === gym.id ? '#0F172A' : '#182234',
                      border: selectedGym?.id === gym.id ? '1px solid #00FF87' : '1px solid #334155',
                      borderRadius: '12px',
                      padding: '1.2rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                      <h4 style={{ margin: 0, fontSize: '1rem', color: '#FFFFFF', fontWeight: '800' }}>
                        {gym.nombre}
                      </h4>
                      <span style={{ backgroundColor: 'rgba(0, 255, 135, 0.15)', color: '#00FF87', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '800' }}>
                        {gym.region}
                      </span>
                    </div>

                    <p style={{ margin: '0 0 0.5rem 0', color: '#94A3B8', fontSize: '0.85rem' }}>
                      📍 {gym.direccion}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.8rem', paddingTop: '0.6rem', borderTop: '1px solid #1E293B' }}>
                      <span style={{ color: '#38BDF8', fontSize: '0.8rem', fontWeight: '600' }}>
                        🏷️ {gym.marca} • {gym.tipo}
                      </span>
                      <span style={{ color: '#00FF87', fontSize: '0.8rem', fontWeight: '700' }}>
                        📞 {gym.telefono}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* VISUALIZADOR DE MAPA Y FICHA TECNICA */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ backgroundColor: '#1E293B', borderRadius: '16px', overflow: 'hidden', border: '1px solid #334155', boxShadow: '0 10px 30px rgba(0,0,0,0.3)', height: '420px' }}>
              <iframe
                key={selectedGym?.id || searchQuery}
                title="Mapa de Gimnasios de Chile"
                src={obtenerUrlMapa()}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
              />
            </div>

            {selectedGym && (
              <div style={{ backgroundColor: '#1E293B', borderRadius: '16px', padding: '1.8rem', border: '1px solid #00FF87', boxShadow: '0 0 25px rgba(0,255,135,0.15)' }}>
                <span style={{ color: '#00FF87', fontSize: '0.8rem', fontWeight: '800' }}>SEDE SELECCIONADA</span>
                <h3 style={{ margin: '0.3rem 0 0.4rem 0', color: '#FFFFFF', fontSize: '1.4rem', fontWeight: '900' }}>
                  {selectedGym.nombre}
                </h3>
                <p style={{ margin: '0 0 1.2rem 0', color: '#94A3B8', fontSize: '0.9rem' }}>
                  📍 {selectedGym.direccion} ({selectedGym.comuna}, Región {selectedGym.region})
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', backgroundColor: '#0F172A', padding: '1.2rem', borderRadius: '12px', border: '1px solid #334155', fontSize: '0.88rem' }}>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Apertura:</span>
                    <strong style={{ color: '#F8FAFC' }}>{selectedGym.fechaApertura}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Administración:</span>
                    <strong style={{ color: '#F8FAFC' }}>{selectedGym.arrendador}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Horarios:</span>
                    <strong style={{ color: '#00FF87' }}>{selectedGym.horarioApertura}</strong>
                  </div>
                  <div>
                    <span style={{ color: '#64748B', display: 'block' }}>Matrícula aprox:</span>
                    <strong style={{ color: '#38BDF8' }}>{selectedGym.costoMatricula}</strong>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
}