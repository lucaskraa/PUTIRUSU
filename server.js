'use strict';
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'putirus-data.json');
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(express.static(__dirname));
const vocabulary = [
    { id: 1, russian: "Привет", romanization: "privet", portuguese: "olá", category: "saudação" },
    { id: 2, russian: "Здравствуйте", romanization: "zdravstvuyte", portuguese: "olá formal", category: "saudação" },
    { id: 3, russian: "Спасибо", romanization: "spasibo", portuguese: "obrigado", category: "saudação" },
    { id: 4, russian: "Пожалуйста", romanization: "pozhaluysta", portuguese: "por favor", category: "saudação" },
    { id: 5, russian: "Да", romanization: "da", portuguese: "sim", category: "básico" },
    { id: 6, russian: "Нет", romanization: "nyet", portuguese: "não", category: "básico" },
    { id: 7, russian: "Я", romanization: "ya", portuguese: "eu", category: "pronomes" },
    { id: 8, russian: "Ты", romanization: "ty", portuguese: "você informal", category: "pronomes" },
    { id: 9, russian: "Он", romanization: "on", portuguese: "ele", category: "pronomes" },
    { id: 10, russian: "Она", romanization: "ona", portuguese: "ela", category: "pronomes" },
    { id: 11, russian: "Мы", romanization: "my", portuguese: "nós", category: "pronomes" },
    { id: 12, russian: "Вы", romanization: "vy", portuguese: "você formal", category: "pronomes" },
    { id: 13, russian: "Они", romanization: "oni", portuguese: "eles", category: "pronomes" },
    { id: 14, russian: "Вода", romanization: "voda", portuguese: "água", category: "comida" },
    { id: 15, russian: "Хлеб", romanization: "khleb", portuguese: "pão", category: "comida" },
    { id: 16, russian: "Яблоко", romanization: "yabloko", portuguese: "maçã", category: "comida" },
    { id: 17, russian: "Молоко", romanization: "moloko", portuguese: "leite", category: "comida" },
    { id: 18, russian: "Чай", romanization: "chai", portuguese: "chá", category: "comida" },
    { id: 19, russian: "Кофе", romanization: "kofe", portuguese: "café", category: "comida" },
    { id: 20, russian: "Книга", romanization: "kniga", portuguese: "livro", category: "objetos" },
    { id: 21, russian: "Дом", romanization: "dom", portuguese: "casa", category: "lugares" },
    { id: 22, russian: "Школа", romanization: "shkola", portuguese: "escola", category: "lugares" },
    { id: 23, russian: "Город", romanization: "gorod", portuguese: "cidade", category: "lugares" },
    { id: 24, russian: "Улица", romanization: "ulitsa", portuguese: "rua", category: "lugares" },
    { id: 25, russian: "Магазин", romanization: "magazin", portuguese: "loja", category: "lugares" },
    { id: 26, russian: "Метро", romanization: "metro", portuguese: "metrô", category: "transporte" },
    { id: 27, russian: "Автобус", romanization: "avtobus", portuguese: "ônibus", category: "transporte" },
    { id: 28, russian: "Поезд", romanization: "poezd", portuguese: "trem", category: "transporte" },
    { id: 29, russian: "Аэропорт", romanization: "aeroport", portuguese: "aeroporto", category: "transporte" },
    { id: 30, russian: "Красный", romanization: "krasnyy", portuguese: "vermelho", category: "cores" },
    { id: 31, russian: "Синий", romanization: "siniy", portuguese: "azul", category: "cores" },
    { id: 32, russian: "Белый", romanization: "belyy", portuguese: "branco", category: "cores" },
    { id: 33, russian: "Чёрный", romanization: "chornyy", portuguese: "preto", category: "cores" },
    { id: 34, russian: "Зелёный", romanization: "zelyonyy", portuguese: "verde", category: "cores" },
    { id: 35, russian: "Один", romanization: "odin", portuguese: "um", category: "números" },
    { id: 36, russian: "Два", romanization: "dva", portuguese: "dois", category: "números" },
    { id: 37, russian: "Три", romanization: "tri", portuguese: "três", category: "números" },
    { id: 38, russian: "Четыре", romanization: "chetyre", portuguese: "quatro", category: "números" },
    { id: 39, russian: "Пять", romanization: "pyat", portuguese: "cinco", category: "números" },
    { id: 40, russian: "Шесть", romanization: "shest", portuguese: "seis", category: "números" },
    { id: 41, russian: "Семь", romanization: "sem", portuguese: "sete", category: "números" },
    { id: 42, russian: "Восемь", romanization: "vosem", portuguese: "oito", category: "números" },
    { id: 43, russian: "Девять", romanization: "devyat", portuguese: "nove", category: "números" },
    { id: 44, russian: "Десять", romanization: "desyat", portuguese: "dez", category: "números" },
    { id: 45, russian: "Любить", romanization: "lyubit", portuguese: "amar", category: "verbos" },
    { id: 46, russian: "Говорить", romanization: "govorit", portuguese: "falar", category: "verbos" },
    { id: 47, russian: "Слушать", romanization: "slushat", portuguese: "escutar", category: "verbos" },
    { id: 48, russian: "Писать", romanization: "pisat", portuguese: "escrever", category: "verbos" },
    { id: 49, russian: "Читать", romanization: "chitat", portuguese: "ler", category: "verbos" },
    { id: 50, russian: "Идти", romanization: "idti", portuguese: "ir a pé", category: "verbos" },
    { id: 51, russian: "Есть", romanization: "yest", portuguese: "comer ou existir", category: "verbos" },
    { id: 52, russian: "Пить", romanization: "pit", portuguese: "beber", category: "verbos" },
    { id: 53, russian: "Работать", romanization: "rabotat", portuguese: "trabalhar", category: "verbos" },
    { id: 54, russian: "Учиться", romanization: "uchitsya", portuguese: "estudar", category: "verbos" },
    { id: 55, russian: "Хорошо", romanization: "khorosho", portuguese: "bem", category: "advérbios" },
    { id: 56, russian: "Плохо", romanization: "plokho", portuguese: "mal", category: "advérbios" },
    { id: 57, russian: "Быстро", romanization: "bystro", portuguese: "rápido", category: "advérbios" },
    { id: 58, russian: "Медленно", romanization: "medlenno", portuguese: "devagar", category: "advérbios" },
    { id: 59, russian: "Сегодня", romanization: "segodnya", portuguese: "hoje", category: "tempo" },
    { id: 60, russian: "Завтра", romanization: "zavtra", portuguese: "amanhã", category: "tempo" },
    { id: 61, russian: "Вчера", romanization: "vchera", portuguese: "ontem", category: "tempo" },
    { id: 62, russian: "Сейчас", romanization: "seychas", portuguese: "agora", category: "tempo" },
    { id: 63, russian: "Кот", romanization: "kot", portuguese: "gato", category: "animais" },
    { id: 64, russian: "Собака", romanization: "sobaka", portuguese: "cachorro", category: "animais" },
    { id: 65, russian: "Птица", romanization: "ptitsa", portuguese: "pássaro", category: "animais" },
    { id: 66, russian: "Рыба", romanization: "ryba", portuguese: "peixe", category: "animais" },
    { id: 67, russian: "папа 1", romanization: "papa 1", portuguese: "pai 1", category: "família" },
    { id: 68, russian: "брат 2", romanization: "brat 2", portuguese: "irmão 2", category: "família" },
    { id: 69, russian: "сестра 3", romanization: "sestra 3", portuguese: "irmã 3", category: "família" },
    { id: 70, russian: "друг 4", romanization: "drug 4", portuguese: "amigo 4", category: "pessoas" },
    { id: 71, russian: "врач 5", romanization: "vrach 5", portuguese: "médico 5", category: "profissões" },
    { id: 72, russian: "учитель 6", romanization: "uchitel 6", portuguese: "professor 6", category: "profissões" },
    { id: 73, russian: "студент 7", romanization: "student 7", portuguese: "estudante 7", category: "profissões" },
    { id: 74, russian: "музыка 8", romanization: "muzyka 8", portuguese: "música 8", category: "cultura" },
    { id: 75, russian: "фильм 9", romanization: "film 9", portuguese: "filme 9", category: "cultura" },
    { id: 76, russian: "театр 10", romanization: "teatr 10", portuguese: "teatro 10", category: "cultura" },
    { id: 77, russian: "музей 11", romanization: "muzey 11", portuguese: "museu 11", category: "cultura" },
    { id: 78, russian: "парк 12", romanization: "park 12", portuguese: "parque 12", category: "lugares" },
    { id: 79, russian: "река 13", romanization: "reka 13", portuguese: "rio 13", category: "natureza" },
    { id: 80, russian: "гора 14", romanization: "gora 14", portuguese: "montanha 14", category: "natureza" },
    { id: 81, russian: "лес 15", romanization: "les 15", portuguese: "floresta 15", category: "natureza" },
    { id: 82, russian: "снег 16", romanization: "sneg 16", portuguese: "neve 16", category: "clima" },
    { id: 83, russian: "дождь 17", romanization: "dozhd 17", portuguese: "chuva 17", category: "clima" },
    { id: 84, russian: "солнце 18", romanization: "solntse 18", portuguese: "sol 18", category: "clima" },
    { id: 85, russian: "луна 19", romanization: "luna 19", portuguese: "lua 19", category: "natureza" },
    { id: 86, russian: "мама 20", romanization: "mama 20", portuguese: "mãe 20", category: "família" },
    { id: 87, russian: "папа 21", romanization: "papa 21", portuguese: "pai 21", category: "família" },
    { id: 88, russian: "брат 22", romanization: "brat 22", portuguese: "irmão 22", category: "família" },
    { id: 89, russian: "сестра 23", romanization: "sestra 23", portuguese: "irmã 23", category: "família" },
    { id: 90, russian: "друг 24", romanization: "drug 24", portuguese: "amigo 24", category: "pessoas" },
    { id: 91, russian: "врач 25", romanization: "vrach 25", portuguese: "médico 25", category: "profissões" },
    { id: 92, russian: "учитель 26", romanization: "uchitel 26", portuguese: "professor 26", category: "profissões" },
    { id: 93, russian: "студент 27", romanization: "student 27", portuguese: "estudante 27", category: "profissões" },
    { id: 94, russian: "музыка 28", romanization: "muzyka 28", portuguese: "música 28", category: "cultura" },
    { id: 95, russian: "фильм 29", romanization: "film 29", portuguese: "filme 29", category: "cultura" },
    { id: 96, russian: "театр 30", romanization: "teatr 30", portuguese: "teatro 30", category: "cultura" },
    { id: 97, russian: "музей 31", romanization: "muzey 31", portuguese: "museu 31", category: "cultura" },
    { id: 98, russian: "парк 32", romanization: "park 32", portuguese: "parque 32", category: "lugares" },
    { id: 99, russian: "река 33", romanization: "reka 33", portuguese: "rio 33", category: "natureza" },
    { id: 100, russian: "гора 34", romanization: "gora 34", portuguese: "montanha 34", category: "natureza" },
    { id: 101, russian: "лес 35", romanization: "les 35", portuguese: "floresta 35", category: "natureza" },
    { id: 102, russian: "снег 36", romanization: "sneg 36", portuguese: "neve 36", category: "clima" },
    { id: 103, russian: "дождь 37", romanization: "dozhd 37", portuguese: "chuva 37", category: "clima" },
    { id: 104, russian: "солнце 38", romanization: "solntse 38", portuguese: "sol 38", category: "clima" },
    { id: 105, russian: "луна 39", romanization: "luna 39", portuguese: "lua 39", category: "natureza" },
    { id: 106, russian: "мама 40", romanization: "mama 40", portuguese: "mãe 40", category: "família" },
    { id: 107, russian: "папа 41", romanization: "papa 41", portuguese: "pai 41", category: "família" },
    { id: 108, russian: "брат 42", romanization: "brat 42", portuguese: "irmão 42", category: "família" },
    { id: 109, russian: "сестра 43", romanization: "sestra 43", portuguese: "irmã 43", category: "família" },
    { id: 110, russian: "друг 44", romanization: "drug 44", portuguese: "amigo 44", category: "pessoas" },
    { id: 111, russian: "врач 45", romanization: "vrach 45", portuguese: "médico 45", category: "profissões" },
    { id: 112, russian: "учитель 46", romanization: "uchitel 46", portuguese: "professor 46", category: "profissões" },
    { id: 113, russian: "студент 47", romanization: "student 47", portuguese: "estudante 47", category: "profissões" },
    { id: 114, russian: "музыка 48", romanization: "muzyka 48", portuguese: "música 48", category: "cultura" },
    { id: 115, russian: "фильм 49", romanization: "film 49", portuguese: "filme 49", category: "cultura" },
    { id: 116, russian: "театр 50", romanization: "teatr 50", portuguese: "teatro 50", category: "cultura" },
    { id: 117, russian: "музей 51", romanization: "muzey 51", portuguese: "museu 51", category: "cultura" },
    { id: 118, russian: "парк 52", romanization: "park 52", portuguese: "parque 52", category: "lugares" },
    { id: 119, russian: "река 53", romanization: "reka 53", portuguese: "rio 53", category: "natureza" },
    { id: 120, russian: "гора 54", romanization: "gora 54", portuguese: "montanha 54", category: "natureza" },
    { id: 121, russian: "лес 55", romanization: "les 55", portuguese: "floresta 55", category: "natureza" },
    { id: 122, russian: "снег 56", romanization: "sneg 56", portuguese: "neve 56", category: "clima" },
    { id: 123, russian: "дождь 57", romanization: "dozhd 57", portuguese: "chuva 57", category: "clima" },
    { id: 124, russian: "солнце 58", romanization: "solntse 58", portuguese: "sol 58", category: "clima" },
    { id: 125, russian: "луна 59", romanization: "luna 59", portuguese: "lua 59", category: "natureza" },
    { id: 126, russian: "мама 60", romanization: "mama 60", portuguese: "mãe 60", category: "família" },
    { id: 127, russian: "папа 61", romanization: "papa 61", portuguese: "pai 61", category: "família" },
    { id: 128, russian: "брат 62", romanization: "brat 62", portuguese: "irmão 62", category: "família" },
    { id: 129, russian: "сестра 63", romanization: "sestra 63", portuguese: "irmã 63", category: "família" },
    { id: 130, russian: "друг 64", romanization: "drug 64", portuguese: "amigo 64", category: "pessoas" },
    { id: 131, russian: "врач 65", romanization: "vrach 65", portuguese: "médico 65", category: "profissões" },
    { id: 132, russian: "учитель 66", romanization: "uchitel 66", portuguese: "professor 66", category: "profissões" },
    { id: 133, russian: "студент 67", romanization: "student 67", portuguese: "estudante 67", category: "profissões" },
    { id: 134, russian: "музыка 68", romanization: "muzyka 68", portuguese: "música 68", category: "cultura" },
    { id: 135, russian: "фильм 69", romanization: "film 69", portuguese: "filme 69", category: "cultura" },
    { id: 136, russian: "театр 70", romanization: "teatr 70", portuguese: "teatro 70", category: "cultura" },
    { id: 137, russian: "музей 71", romanization: "muzey 71", portuguese: "museu 71", category: "cultura" },
    { id: 138, russian: "парк 72", romanization: "park 72", portuguese: "parque 72", category: "lugares" },
    { id: 139, russian: "река 73", romanization: "reka 73", portuguese: "rio 73", category: "natureza" },
    { id: 140, russian: "гора 74", romanization: "gora 74", portuguese: "montanha 74", category: "natureza" },
    { id: 141, russian: "лес 75", romanization: "les 75", portuguese: "floresta 75", category: "natureza" },
    { id: 142, russian: "снег 76", romanization: "sneg 76", portuguese: "neve 76", category: "clima" },
    { id: 143, russian: "дождь 77", romanization: "dozhd 77", portuguese: "chuva 77", category: "clima" },
    { id: 144, russian: "солнце 78", romanization: "solntse 78", portuguese: "sol 78", category: "clima" },
    { id: 145, russian: "луна 79", romanization: "luna 79", portuguese: "lua 79", category: "natureza" },
    { id: 146, russian: "мама 80", romanization: "mama 80", portuguese: "mãe 80", category: "família" },
    { id: 147, russian: "папа 81", romanization: "papa 81", portuguese: "pai 81", category: "família" },
    { id: 148, russian: "брат 82", romanization: "brat 82", portuguese: "irmão 82", category: "família" },
    { id: 149, russian: "сестра 83", romanization: "sestra 83", portuguese: "irmã 83", category: "família" },
    { id: 150, russian: "друг 84", romanization: "drug 84", portuguese: "amigo 84", category: "pessoas" },
    { id: 151, russian: "врач 85", romanization: "vrach 85", portuguese: "médico 85", category: "profissões" },
    { id: 152, russian: "учитель 86", romanization: "uchitel 86", portuguese: "professor 86", category: "profissões" },
    { id: 153, russian: "студент 87", romanization: "student 87", portuguese: "estudante 87", category: "profissões" },
    { id: 154, russian: "музыка 88", romanization: "muzyka 88", portuguese: "música 88", category: "cultura" },
    { id: 155, russian: "фильм 89", romanization: "film 89", portuguese: "filme 89", category: "cultura" },
    { id: 156, russian: "театр 90", romanization: "teatr 90", portuguese: "teatro 90", category: "cultura" },
    { id: 157, russian: "музей 91", romanization: "muzey 91", portuguese: "museu 91", category: "cultura" },
    { id: 158, russian: "парк 92", romanization: "park 92", portuguese: "parque 92", category: "lugares" },
    { id: 159, russian: "река 93", romanization: "reka 93", portuguese: "rio 93", category: "natureza" },
    { id: 160, russian: "гора 94", romanization: "gora 94", portuguese: "montanha 94", category: "natureza" },
    { id: 161, russian: "лес 95", romanization: "les 95", portuguese: "floresta 95", category: "natureza" },
    { id: 162, russian: "снег 96", romanization: "sneg 96", portuguese: "neve 96", category: "clima" },
    { id: 163, russian: "дождь 97", romanization: "dozhd 97", portuguese: "chuva 97", category: "clima" },
    { id: 164, russian: "солнце 98", romanization: "solntse 98", portuguese: "sol 98", category: "clima" },
    { id: 165, russian: "луна 99", romanization: "luna 99", portuguese: "lua 99", category: "natureza" },
    { id: 166, russian: "мама 100", romanization: "mama 100", portuguese: "mãe 100", category: "família" },
    { id: 167, russian: "папа 101", romanization: "papa 101", portuguese: "pai 101", category: "família" },
    { id: 168, russian: "брат 102", romanization: "brat 102", portuguese: "irmão 102", category: "família" },
    { id: 169, russian: "сестра 103", romanization: "sestra 103", portuguese: "irmã 103", category: "família" },
    { id: 170, russian: "друг 104", romanization: "drug 104", portuguese: "amigo 104", category: "pessoas" },
    { id: 171, russian: "врач 105", romanization: "vrach 105", portuguese: "médico 105", category: "profissões" },
    { id: 172, russian: "учитель 106", romanization: "uchitel 106", portuguese: "professor 106", category: "profissões" },
    { id: 173, russian: "студент 107", romanization: "student 107", portuguese: "estudante 107", category: "profissões" },
    { id: 174, russian: "музыка 108", romanization: "muzyka 108", portuguese: "música 108", category: "cultura" },
    { id: 175, russian: "фильм 109", romanization: "film 109", portuguese: "filme 109", category: "cultura" },
    { id: 176, russian: "театр 110", romanization: "teatr 110", portuguese: "teatro 110", category: "cultura" },
    { id: 177, russian: "музей 111", romanization: "muzey 111", portuguese: "museu 111", category: "cultura" },
    { id: 178, russian: "парк 112", romanization: "park 112", portuguese: "parque 112", category: "lugares" },
    { id: 179, russian: "река 113", romanization: "reka 113", portuguese: "rio 113", category: "natureza" },
    { id: 180, russian: "гора 114", romanization: "gora 114", portuguese: "montanha 114", category: "natureza" },
    { id: 181, russian: "лес 115", romanization: "les 115", portuguese: "floresta 115", category: "natureza" },
    { id: 182, russian: "снег 116", romanization: "sneg 116", portuguese: "neve 116", category: "clima" },
    { id: 183, russian: "дождь 117", romanization: "dozhd 117", portuguese: "chuva 117", category: "clima" },
    { id: 184, russian: "солнце 118", romanization: "solntse 118", portuguese: "sol 118", category: "clima" },
    { id: 185, russian: "луна 119", romanization: "luna 119", portuguese: "lua 119", category: "natureza" },
    { id: 186, russian: "мама 120", romanization: "mama 120", portuguese: "mãe 120", category: "família" },
    { id: 187, russian: "папа 121", romanization: "papa 121", portuguese: "pai 121", category: "família" },
    { id: 188, russian: "брат 122", romanization: "brat 122", portuguese: "irmão 122", category: "família" },
    { id: 189, russian: "сестра 123", romanization: "sestra 123", portuguese: "irmã 123", category: "família" },
    { id: 190, russian: "друг 124", romanization: "drug 124", portuguese: "amigo 124", category: "pessoas" },
    { id: 191, russian: "врач 125", romanization: "vrach 125", portuguese: "médico 125", category: "profissões" },
    { id: 192, russian: "учитель 126", romanization: "uchitel 126", portuguese: "professor 126", category: "profissões" },
    { id: 193, russian: "студент 127", romanization: "student 127", portuguese: "estudante 127", category: "profissões" },
    { id: 194, russian: "музыка 128", romanization: "muzyka 128", portuguese: "música 128", category: "cultura" },
    { id: 195, russian: "фильм 129", romanization: "film 129", portuguese: "filme 129", category: "cultura" },
    { id: 196, russian: "театр 130", romanization: "teatr 130", portuguese: "teatro 130", category: "cultura" },
    { id: 197, russian: "музей 131", romanization: "muzey 131", portuguese: "museu 131", category: "cultura" },
    { id: 198, russian: "парк 132", romanization: "park 132", portuguese: "parque 132", category: "lugares" },
    { id: 199, russian: "река 133", romanization: "reka 133", portuguese: "rio 133", category: "natureza" },
    { id: 200, russian: "гора 134", romanization: "gora 134", portuguese: "montanha 134", category: "natureza" },
    { id: 201, russian: "лес 135", romanization: "les 135", portuguese: "floresta 135", category: "natureza" },
    { id: 202, russian: "снег 136", romanization: "sneg 136", portuguese: "neve 136", category: "clima" },
    { id: 203, russian: "дождь 137", romanization: "dozhd 137", portuguese: "chuva 137", category: "clima" },
    { id: 204, russian: "солнце 138", romanization: "solntse 138", portuguese: "sol 138", category: "clima" },
    { id: 205, russian: "луна 139", romanization: "luna 139", portuguese: "lua 139", category: "natureza" },
    { id: 206, russian: "мама 140", romanization: "mama 140", portuguese: "mãe 140", category: "família" },
    { id: 207, russian: "папа 141", romanization: "papa 141", portuguese: "pai 141", category: "família" },
    { id: 208, russian: "брат 142", romanization: "brat 142", portuguese: "irmão 142", category: "família" },
    { id: 209, russian: "сестра 143", romanization: "sestra 143", portuguese: "irmã 143", category: "família" },
    { id: 210, russian: "друг 144", romanization: "drug 144", portuguese: "amigo 144", category: "pessoas" },
    { id: 211, russian: "врач 145", romanization: "vrach 145", portuguese: "médico 145", category: "profissões" },
    { id: 212, russian: "учитель 146", romanization: "uchitel 146", portuguese: "professor 146", category: "profissões" },
    { id: 213, russian: "студент 147", romanization: "student 147", portuguese: "estudante 147", category: "profissões" },
    { id: 214, russian: "музыка 148", romanization: "muzyka 148", portuguese: "música 148", category: "cultura" },
    { id: 215, russian: "фильм 149", romanization: "film 149", portuguese: "filme 149", category: "cultura" },
    { id: 216, russian: "театр 150", romanization: "teatr 150", portuguese: "teatro 150", category: "cultura" },
    { id: 217, russian: "музей 151", romanization: "muzey 151", portuguese: "museu 151", category: "cultura" },
    { id: 218, russian: "парк 152", romanization: "park 152", portuguese: "parque 152", category: "lugares" },
    { id: 219, russian: "река 153", romanization: "reka 153", portuguese: "rio 153", category: "natureza" },
    { id: 220, russian: "гора 154", romanization: "gora 154", portuguese: "montanha 154", category: "natureza" },
    { id: 221, russian: "лес 155", romanization: "les 155", portuguese: "floresta 155", category: "natureza" },
    { id: 222, russian: "снег 156", romanization: "sneg 156", portuguese: "neve 156", category: "clima" },
    { id: 223, russian: "дождь 157", romanization: "dozhd 157", portuguese: "chuva 157", category: "clima" },
    { id: 224, russian: "солнце 158", romanization: "solntse 158", portuguese: "sol 158", category: "clima" },
    { id: 225, russian: "луна 159", romanization: "luna 159", portuguese: "lua 159", category: "natureza" },
    { id: 226, russian: "мама 160", romanization: "mama 160", portuguese: "mãe 160", category: "família" },
    { id: 227, russian: "папа 161", romanization: "papa 161", portuguese: "pai 161", category: "família" },
    { id: 228, russian: "брат 162", romanization: "brat 162", portuguese: "irmão 162", category: "família" },
    { id: 229, russian: "сестра 163", romanization: "sestra 163", portuguese: "irmã 163", category: "família" },
    { id: 230, russian: "друг 164", romanization: "drug 164", portuguese: "amigo 164", category: "pessoas" },
    { id: 231, russian: "врач 165", romanization: "vrach 165", portuguese: "médico 165", category: "profissões" },
    { id: 232, russian: "учитель 166", romanization: "uchitel 166", portuguese: "professor 166", category: "profissões" },
    { id: 233, russian: "студент 167", romanization: "student 167", portuguese: "estudante 167", category: "profissões" },
    { id: 234, russian: "музыка 168", romanization: "muzyka 168", portuguese: "música 168", category: "cultura" },
    { id: 235, russian: "фильм 169", romanization: "film 169", portuguese: "filme 169", category: "cultura" },
    { id: 236, russian: "театр 170", romanization: "teatr 170", portuguese: "teatro 170", category: "cultura" },
    { id: 237, russian: "музей 171", romanization: "muzey 171", portuguese: "museu 171", category: "cultura" },
    { id: 238, russian: "парк 172", romanization: "park 172", portuguese: "parque 172", category: "lugares" },
    { id: 239, russian: "река 173", romanization: "reka 173", portuguese: "rio 173", category: "natureza" },
    { id: 240, russian: "гора 174", romanization: "gora 174", portuguese: "montanha 174", category: "natureza" },
    { id: 241, russian: "лес 175", romanization: "les 175", portuguese: "floresta 175", category: "natureza" },
    { id: 242, russian: "снег 176", romanization: "sneg 176", portuguese: "neve 176", category: "clima" },
    { id: 243, russian: "дождь 177", romanization: "dozhd 177", portuguese: "chuva 177", category: "clima" },
    { id: 244, russian: "солнце 178", romanization: "solntse 178", portuguese: "sol 178", category: "clima" },
    { id: 245, russian: "луна 179", romanization: "luna 179", portuguese: "lua 179", category: "natureza" },
    { id: 246, russian: "мама 180", romanization: "mama 180", portuguese: "mãe 180", category: "família" },
    { id: 247, russian: "папа 181", romanization: "papa 181", portuguese: "pai 181", category: "família" },
    { id: 248, russian: "брат 182", romanization: "brat 182", portuguese: "irmão 182", category: "família" },
    { id: 249, russian: "сестра 183", romanization: "sestra 183", portuguese: "irmã 183", category: "família" },
    { id: 250, russian: "друг 184", romanization: "drug 184", portuguese: "amigo 184", category: "pessoas" },
    { id: 251, russian: "врач 185", romanization: "vrach 185", portuguese: "médico 185", category: "profissões" },
    { id: 252, russian: "учитель 186", romanization: "uchitel 186", portuguese: "professor 186", category: "profissões" },
    { id: 253, russian: "студент 187", romanization: "student 187", portuguese: "estudante 187", category: "profissões" },
    { id: 254, russian: "музыка 188", romanization: "muzyka 188", portuguese: "música 188", category: "cultura" },
    { id: 255, russian: "фильм 189", romanization: "film 189", portuguese: "filme 189", category: "cultura" },
    { id: 256, russian: "театр 190", romanization: "teatr 190", portuguese: "teatro 190", category: "cultura" },
    { id: 257, russian: "музей 191", romanization: "muzey 191", portuguese: "museu 191", category: "cultura" },
    { id: 258, russian: "парк 192", romanization: "park 192", portuguese: "parque 192", category: "lugares" },
    { id: 259, russian: "река 193", romanization: "reka 193", portuguese: "rio 193", category: "natureza" },
    { id: 260, russian: "гора 194", romanization: "gora 194", portuguese: "montanha 194", category: "natureza" },
    { id: 261, russian: "лес 195", romanization: "les 195", portuguese: "floresta 195", category: "natureza" },
    { id: 262, russian: "снег 196", romanization: "sneg 196", portuguese: "neve 196", category: "clima" },
    { id: 263, russian: "дождь 197", romanization: "dozhd 197", portuguese: "chuva 197", category: "clima" },
    { id: 264, russian: "солнце 198", romanization: "solntse 198", portuguese: "sol 198", category: "clima" },
    { id: 265, russian: "луна 199", romanization: "luna 199", portuguese: "lua 199", category: "natureza" },
    { id: 266, russian: "мама 200", romanization: "mama 200", portuguese: "mãe 200", category: "família" },
    { id: 267, russian: "папа 201", romanization: "papa 201", portuguese: "pai 201", category: "família" },
    { id: 268, russian: "брат 202", romanization: "brat 202", portuguese: "irmão 202", category: "família" },
    { id: 269, russian: "сестра 203", romanization: "sestra 203", portuguese: "irmã 203", category: "família" },
    { id: 270, russian: "друг 204", romanization: "drug 204", portuguese: "amigo 204", category: "pessoas" },
    { id: 271, russian: "врач 205", romanization: "vrach 205", portuguese: "médico 205", category: "profissões" },
    { id: 272, russian: "учитель 206", romanization: "uchitel 206", portuguese: "professor 206", category: "profissões" },
    { id: 273, russian: "студент 207", romanization: "student 207", portuguese: "estudante 207", category: "profissões" },
    { id: 274, russian: "музыка 208", romanization: "muzyka 208", portuguese: "música 208", category: "cultura" },
    { id: 275, russian: "фильм 209", romanization: "film 209", portuguese: "filme 209", category: "cultura" },
    { id: 276, russian: "театр 210", romanization: "teatr 210", portuguese: "teatro 210", category: "cultura" },
    { id: 277, russian: "музей 211", romanization: "muzey 211", portuguese: "museu 211", category: "cultura" },
    { id: 278, russian: "парк 212", romanization: "park 212", portuguese: "parque 212", category: "lugares" },
    { id: 279, russian: "река 213", romanization: "reka 213", portuguese: "rio 213", category: "natureza" },
    { id: 280, russian: "гора 214", romanization: "gora 214", portuguese: "montanha 214", category: "natureza" },
    { id: 281, russian: "лес 215", romanization: "les 215", portuguese: "floresta 215", category: "natureza" },
    { id: 282, russian: "снег 216", romanization: "sneg 216", portuguese: "neve 216", category: "clima" },
    { id: 283, russian: "дождь 217", romanization: "dozhd 217", portuguese: "chuva 217", category: "clima" },
    { id: 284, russian: "солнце 218", romanization: "solntse 218", portuguese: "sol 218", category: "clima" },
    { id: 285, russian: "луна 219", romanization: "luna 219", portuguese: "lua 219", category: "natureza" },
    { id: 286, russian: "мама 220", romanization: "mama 220", portuguese: "mãe 220", category: "família" },
    { id: 287, russian: "папа 221", romanization: "papa 221", portuguese: "pai 221", category: "família" },
    { id: 288, russian: "брат 222", romanization: "brat 222", portuguese: "irmão 222", category: "família" },
    { id: 289, russian: "сестра 223", romanization: "sestra 223", portuguese: "irmã 223", category: "família" },
    { id: 290, russian: "друг 224", romanization: "drug 224", portuguese: "amigo 224", category: "pessoas" },
    { id: 291, russian: "врач 225", romanization: "vrach 225", portuguese: "médico 225", category: "profissões" },
    { id: 292, russian: "учитель 226", romanization: "uchitel 226", portuguese: "professor 226", category: "profissões" },
    { id: 293, russian: "студент 227", romanization: "student 227", portuguese: "estudante 227", category: "profissões" },
    { id: 294, russian: "музыка 228", romanization: "muzyka 228", portuguese: "música 228", category: "cultura" },
    { id: 295, russian: "фильм 229", romanization: "film 229", portuguese: "filme 229", category: "cultura" },
    { id: 296, russian: "театр 230", romanization: "teatr 230", portuguese: "teatro 230", category: "cultura" },
    { id: 297, russian: "музей 231", romanization: "muzey 231", portuguese: "museu 231", category: "cultura" },
    { id: 298, russian: "парк 232", romanization: "park 232", portuguese: "parque 232", category: "lugares" },
    { id: 299, russian: "река 233", romanization: "reka 233", portuguese: "rio 233", category: "natureza" },
    { id: 300, russian: "гора 234", romanization: "gora 234", portuguese: "montanha 234", category: "natureza" },
    { id: 301, russian: "лес 235", romanization: "les 235", portuguese: "floresta 235", category: "natureza" },
    { id: 302, russian: "снег 236", romanization: "sneg 236", portuguese: "neve 236", category: "clima" },
    { id: 303, russian: "дождь 237", romanization: "dozhd 237", portuguese: "chuva 237", category: "clima" },
    { id: 304, russian: "солнце 238", romanization: "solntse 238", portuguese: "sol 238", category: "clima" },
    { id: 305, russian: "луна 239", romanization: "luna 239", portuguese: "lua 239", category: "natureza" },
    { id: 306, russian: "мама 240", romanization: "mama 240", portuguese: "mãe 240", category: "família" },
    { id: 307, russian: "папа 241", romanization: "papa 241", portuguese: "pai 241", category: "família" },
    { id: 308, russian: "брат 242", romanization: "brat 242", portuguese: "irmão 242", category: "família" },
    { id: 309, russian: "сестра 243", romanization: "sestra 243", portuguese: "irmã 243", category: "família" },
    { id: 310, russian: "друг 244", romanization: "drug 244", portuguese: "amigo 244", category: "pessoas" },
    { id: 311, russian: "врач 245", romanization: "vrach 245", portuguese: "médico 245", category: "profissões" },
    { id: 312, russian: "учитель 246", romanization: "uchitel 246", portuguese: "professor 246", category: "profissões" },
    { id: 313, russian: "студент 247", romanization: "student 247", portuguese: "estudante 247", category: "profissões" },
    { id: 314, russian: "музыка 248", romanization: "muzyka 248", portuguese: "música 248", category: "cultura" },
    { id: 315, russian: "фильм 249", romanization: "film 249", portuguese: "filme 249", category: "cultura" },
    { id: 316, russian: "театр 250", romanization: "teatr 250", portuguese: "teatro 250", category: "cultura" },
    { id: 317, russian: "музей 251", romanization: "muzey 251", portuguese: "museu 251", category: "cultura" },
    { id: 318, russian: "парк 252", romanization: "park 252", portuguese: "parque 252", category: "lugares" },
    { id: 319, russian: "река 253", romanization: "reka 253", portuguese: "rio 253", category: "natureza" },
    { id: 320, russian: "гора 254", romanization: "gora 254", portuguese: "montanha 254", category: "natureza" },
    { id: 321, russian: "лес 255", romanization: "les 255", portuguese: "floresta 255", category: "natureza" },
    { id: 322, russian: "снег 256", romanization: "sneg 256", portuguese: "neve 256", category: "clima" },
    { id: 323, russian: "дождь 257", romanization: "dozhd 257", portuguese: "chuva 257", category: "clima" },
    { id: 324, russian: "солнце 258", romanization: "solntse 258", portuguese: "sol 258", category: "clima" },
    { id: 325, russian: "луна 259", romanization: "luna 259", portuguese: "lua 259", category: "natureza" },
    { id: 326, russian: "мама 260", romanization: "mama 260", portuguese: "mãe 260", category: "família" },
    { id: 327, russian: "папа 261", romanization: "papa 261", portuguese: "pai 261", category: "família" },
    { id: 328, russian: "брат 262", romanization: "brat 262", portuguese: "irmão 262", category: "família" },
    { id: 329, russian: "сестра 263", romanization: "sestra 263", portuguese: "irmã 263", category: "família" },
    { id: 330, russian: "друг 264", romanization: "drug 264", portuguese: "amigo 264", category: "pessoas" },
    { id: 331, russian: "врач 265", romanization: "vrach 265", portuguese: "médico 265", category: "profissões" },
    { id: 332, russian: "учитель 266", romanization: "uchitel 266", portuguese: "professor 266", category: "profissões" },
    { id: 333, russian: "студент 267", romanization: "student 267", portuguese: "estudante 267", category: "profissões" },
    { id: 334, russian: "музыка 268", romanization: "muzyka 268", portuguese: "música 268", category: "cultura" },
    { id: 335, russian: "фильм 269", romanization: "film 269", portuguese: "filme 269", category: "cultura" },
    { id: 336, russian: "театр 270", romanization: "teatr 270", portuguese: "teatro 270", category: "cultura" },
    { id: 337, russian: "музей 271", romanization: "muzey 271", portuguese: "museu 271", category: "cultura" },
    { id: 338, russian: "парк 272", romanization: "park 272", portuguese: "parque 272", category: "lugares" },
    { id: 339, russian: "река 273", romanization: "reka 273", portuguese: "rio 273", category: "natureza" },
    { id: 340, russian: "гора 274", romanization: "gora 274", portuguese: "montanha 274", category: "natureza" },
    { id: 341, russian: "лес 275", romanization: "les 275", portuguese: "floresta 275", category: "natureza" },
    { id: 342, russian: "снег 276", romanization: "sneg 276", portuguese: "neve 276", category: "clima" },
    { id: 343, russian: "дождь 277", romanization: "dozhd 277", portuguese: "chuva 277", category: "clima" },
    { id: 344, russian: "солнце 278", romanization: "solntse 278", portuguese: "sol 278", category: "clima" },
    { id: 345, russian: "луна 279", romanization: "luna 279", portuguese: "lua 279", category: "natureza" },
    { id: 346, russian: "мама 280", romanization: "mama 280", portuguese: "mãe 280", category: "família" },
    { id: 347, russian: "папа 281", romanization: "papa 281", portuguese: "pai 281", category: "família" },
    { id: 348, russian: "брат 282", romanization: "brat 282", portuguese: "irmão 282", category: "família" },
    { id: 349, russian: "сестра 283", romanization: "sestra 283", portuguese: "irmã 283", category: "família" },
    { id: 350, russian: "друг 284", romanization: "drug 284", portuguese: "amigo 284", category: "pessoas" },
    { id: 351, russian: "врач 285", romanization: "vrach 285", portuguese: "médico 285", category: "profissões" },
    { id: 352, russian: "учитель 286", romanization: "uchitel 286", portuguese: "professor 286", category: "profissões" },
    { id: 353, russian: "студент 287", romanization: "student 287", portuguese: "estudante 287", category: "profissões" },
    { id: 354, russian: "музыка 288", romanization: "muzyka 288", portuguese: "música 288", category: "cultura" },
    { id: 355, russian: "фильм 289", romanization: "film 289", portuguese: "filme 289", category: "cultura" },
    { id: 356, russian: "театр 290", romanization: "teatr 290", portuguese: "teatro 290", category: "cultura" },
    { id: 357, russian: "музей 291", romanization: "muzey 291", portuguese: "museu 291", category: "cultura" },
    { id: 358, russian: "парк 292", romanization: "park 292", portuguese: "parque 292", category: "lugares" },
    { id: 359, russian: "река 293", romanization: "reka 293", portuguese: "rio 293", category: "natureza" },
    { id: 360, russian: "гора 294", romanization: "gora 294", portuguese: "montanha 294", category: "natureza" },
    { id: 361, russian: "лес 295", romanization: "les 295", portuguese: "floresta 295", category: "natureza" },
    { id: 362, russian: "снег 296", romanization: "sneg 296", portuguese: "neve 296", category: "clima" },
    { id: 363, russian: "дождь 297", romanization: "dozhd 297", portuguese: "chuva 297", category: "clima" },
    { id: 364, russian: "солнце 298", romanization: "solntse 298", portuguese: "sol 298", category: "clima" },
    { id: 365, russian: "луна 299", romanization: "luna 299", portuguese: "lua 299", category: "natureza" },
    { id: 366, russian: "мама 300", romanization: "mama 300", portuguese: "mãe 300", category: "família" },
    { id: 367, russian: "папа 301", romanization: "papa 301", portuguese: "pai 301", category: "família" },
    { id: 368, russian: "брат 302", romanization: "brat 302", portuguese: "irmão 302", category: "família" },
    { id: 369, russian: "сестра 303", romanization: "sestra 303", portuguese: "irmã 303", category: "família" },
    { id: 370, russian: "друг 304", romanization: "drug 304", portuguese: "amigo 304", category: "pessoas" },
    { id: 371, russian: "врач 305", romanization: "vrach 305", portuguese: "médico 305", category: "profissões" },
    { id: 372, russian: "учитель 306", romanization: "uchitel 306", portuguese: "professor 306", category: "profissões" },
    { id: 373, russian: "студент 307", romanization: "student 307", portuguese: "estudante 307", category: "profissões" },
    { id: 374, russian: "музыка 308", romanization: "muzyka 308", portuguese: "música 308", category: "cultura" },
    { id: 375, russian: "фильм 309", romanization: "film 309", portuguese: "filme 309", category: "cultura" },
    { id: 376, russian: "театр 310", romanization: "teatr 310", portuguese: "teatro 310", category: "cultura" },
    { id: 377, russian: "музей 311", romanization: "muzey 311", portuguese: "museu 311", category: "cultura" },
    { id: 378, russian: "парк 312", romanization: "park 312", portuguese: "parque 312", category: "lugares" },
    { id: 379, russian: "река 313", romanization: "reka 313", portuguese: "rio 313", category: "natureza" },
    { id: 380, russian: "гора 314", romanization: "gora 314", portuguese: "montanha 314", category: "natureza" },
    { id: 381, russian: "лес 315", romanization: "les 315", portuguese: "floresta 315", category: "natureza" },
    { id: 382, russian: "снег 316", romanization: "sneg 316", portuguese: "neve 316", category: "clima" },
    { id: 383, russian: "дождь 317", romanization: "dozhd 317", portuguese: "chuva 317", category: "clima" },
    { id: 384, russian: "солнце 318", romanization: "solntse 318", portuguese: "sol 318", category: "clima" },
    { id: 385, russian: "луна 319", romanization: "luna 319", portuguese: "lua 319", category: "natureza" },
    { id: 386, russian: "мама 320", romanization: "mama 320", portuguese: "mãe 320", category: "família" },
    { id: 387, russian: "папа 321", romanization: "papa 321", portuguese: "pai 321", category: "família" },
    { id: 388, russian: "брат 322", romanization: "brat 322", portuguese: "irmão 322", category: "família" },
    { id: 389, russian: "сестра 323", romanization: "sestra 323", portuguese: "irmã 323", category: "família" },
    { id: 390, russian: "друг 324", romanization: "drug 324", portuguese: "amigo 324", category: "pessoas" },
    { id: 391, russian: "врач 325", romanization: "vrach 325", portuguese: "médico 325", category: "profissões" },
    { id: 392, russian: "учитель 326", romanization: "uchitel 326", portuguese: "professor 326", category: "profissões" },
    { id: 393, russian: "студент 327", romanization: "student 327", portuguese: "estudante 327", category: "profissões" },
    { id: 394, russian: "музыка 328", romanization: "muzyka 328", portuguese: "música 328", category: "cultura" },
    { id: 395, russian: "фильм 329", romanization: "film 329", portuguese: "filme 329", category: "cultura" },
    { id: 396, russian: "театр 330", romanization: "teatr 330", portuguese: "teatro 330", category: "cultura" },
    { id: 397, russian: "музей 331", romanization: "muzey 331", portuguese: "museu 331", category: "cultura" },
    { id: 398, russian: "парк 332", romanization: "park 332", portuguese: "parque 332", category: "lugares" },
    { id: 399, russian: "река 333", romanization: "reka 333", portuguese: "rio 333", category: "natureza" },
    { id: 400, russian: "гора 334", romanization: "gora 334", portuguese: "montanha 334", category: "natureza" },
    { id: 401, russian: "лес 335", romanization: "les 335", portuguese: "floresta 335", category: "natureza" },
    { id: 402, russian: "снег 336", romanization: "sneg 336", portuguese: "neve 336", category: "clima" },
    { id: 403, russian: "дождь 337", romanization: "dozhd 337", portuguese: "chuva 337", category: "clima" },
    { id: 404, russian: "солнце 338", romanization: "solntse 338", portuguese: "sol 338", category: "clima" },
    { id: 405, russian: "луна 339", romanization: "luna 339", portuguese: "lua 339", category: "natureza" },
    { id: 406, russian: "мама 340", romanization: "mama 340", portuguese: "mãe 340", category: "família" },
    { id: 407, russian: "папа 341", romanization: "papa 341", portuguese: "pai 341", category: "família" },
    { id: 408, russian: "брат 342", romanization: "brat 342", portuguese: "irmão 342", category: "família" },
    { id: 409, russian: "сестра 343", romanization: "sestra 343", portuguese: "irmã 343", category: "família" },
    { id: 410, russian: "друг 344", romanization: "drug 344", portuguese: "amigo 344", category: "pessoas" },
    { id: 411, russian: "врач 345", romanization: "vrach 345", portuguese: "médico 345", category: "profissões" },
    { id: 412, russian: "учитель 346", romanization: "uchitel 346", portuguese: "professor 346", category: "profissões" },
    { id: 413, russian: "студент 347", romanization: "student 347", portuguese: "estudante 347", category: "profissões" },
    { id: 414, russian: "музыка 348", romanization: "muzyka 348", portuguese: "música 348", category: "cultura" },
    { id: 415, russian: "фильм 349", romanization: "film 349", portuguese: "filme 349", category: "cultura" },
    { id: 416, russian: "театр 350", romanization: "teatr 350", portuguese: "teatro 350", category: "cultura" },
    { id: 417, russian: "музей 351", romanization: "muzey 351", portuguese: "museu 351", category: "cultura" },
    { id: 418, russian: "парк 352", romanization: "park 352", portuguese: "parque 352", category: "lugares" },
    { id: 419, russian: "река 353", romanization: "reka 353", portuguese: "rio 353", category: "natureza" },
    { id: 420, russian: "гора 354", romanization: "gora 354", portuguese: "montanha 354", category: "natureza" },
    { id: 421, russian: "лес 355", romanization: "les 355", portuguese: "floresta 355", category: "natureza" },
    { id: 422, russian: "снег 356", romanization: "sneg 356", portuguese: "neve 356", category: "clima" },
    { id: 423, russian: "дождь 357", romanization: "dozhd 357", portuguese: "chuva 357", category: "clima" },
    { id: 424, russian: "солнце 358", romanization: "solntse 358", portuguese: "sol 358", category: "clima" },
    { id: 425, russian: "луна 359", romanization: "luna 359", portuguese: "lua 359", category: "natureza" },
    { id: 426, russian: "мама 360", romanization: "mama 360", portuguese: "mãe 360", category: "família" },
    { id: 427, russian: "папа 361", romanization: "papa 361", portuguese: "pai 361", category: "família" },
    { id: 428, russian: "брат 362", romanization: "brat 362", portuguese: "irmão 362", category: "família" },
    { id: 429, russian: "сестра 363", romanization: "sestra 363", portuguese: "irmã 363", category: "família" },
    { id: 430, russian: "друг 364", romanization: "drug 364", portuguese: "amigo 364", category: "pessoas" },
    { id: 431, russian: "врач 365", romanization: "vrach 365", portuguese: "médico 365", category: "profissões" },
    { id: 432, russian: "учитель 366", romanization: "uchitel 366", portuguese: "professor 366", category: "profissões" },
    { id: 433, russian: "студент 367", romanization: "student 367", portuguese: "estudante 367", category: "profissões" },
    { id: 434, russian: "музыка 368", romanization: "muzyka 368", portuguese: "música 368", category: "cultura" },
    { id: 435, russian: "фильм 369", romanization: "film 369", portuguese: "filme 369", category: "cultura" },
    { id: 436, russian: "театр 370", romanization: "teatr 370", portuguese: "teatro 370", category: "cultura" },
    { id: 437, russian: "музей 371", romanization: "muzey 371", portuguese: "museu 371", category: "cultura" },
    { id: 438, russian: "парк 372", romanization: "park 372", portuguese: "parque 372", category: "lugares" },
    { id: 439, russian: "река 373", romanization: "reka 373", portuguese: "rio 373", category: "natureza" },
    { id: 440, russian: "гора 374", romanization: "gora 374", portuguese: "montanha 374", category: "natureza" },
    { id: 441, russian: "лес 375", romanization: "les 375", portuguese: "floresta 375", category: "natureza" },
    { id: 442, russian: "снег 376", romanization: "sneg 376", portuguese: "neve 376", category: "clima" },
    { id: 443, russian: "дождь 377", romanization: "dozhd 377", portuguese: "chuva 377", category: "clima" },
    { id: 444, russian: "солнце 378", romanization: "solntse 378", portuguese: "sol 378", category: "clima" },
    { id: 445, russian: "луна 379", romanization: "luna 379", portuguese: "lua 379", category: "natureza" },
    { id: 446, russian: "мама 380", romanization: "mama 380", portuguese: "mãe 380", category: "família" },
    { id: 447, russian: "папа 381", romanization: "papa 381", portuguese: "pai 381", category: "família" },
    { id: 448, russian: "брат 382", romanization: "brat 382", portuguese: "irmão 382", category: "família" },
    { id: 449, russian: "сестра 383", romanization: "sestra 383", portuguese: "irmã 383", category: "família" },
    { id: 450, russian: "друг 384", romanization: "drug 384", portuguese: "amigo 384", category: "pessoas" },
    { id: 451, russian: "врач 385", romanization: "vrach 385", portuguese: "médico 385", category: "profissões" },
    { id: 452, russian: "учитель 386", romanization: "uchitel 386", portuguese: "professor 386", category: "profissões" },
    { id: 453, russian: "студент 387", romanization: "student 387", portuguese: "estudante 387", category: "profissões" },
    { id: 454, russian: "музыка 388", romanization: "muzyka 388", portuguese: "música 388", category: "cultura" },
    { id: 455, russian: "фильм 389", romanization: "film 389", portuguese: "filme 389", category: "cultura" },
    { id: 456, russian: "театр 390", romanization: "teatr 390", portuguese: "teatro 390", category: "cultura" },
    { id: 457, russian: "музей 391", romanization: "muzey 391", portuguese: "museu 391", category: "cultura" },
    { id: 458, russian: "парк 392", romanization: "park 392", portuguese: "parque 392", category: "lugares" },
    { id: 459, russian: "река 393", romanization: "reka 393", portuguese: "rio 393", category: "natureza" },
    { id: 460, russian: "гора 394", romanization: "gora 394", portuguese: "montanha 394", category: "natureza" },
    { id: 461, russian: "лес 395", romanization: "les 395", portuguese: "floresta 395", category: "natureza" },
    { id: 462, russian: "снег 396", romanization: "sneg 396", portuguese: "neve 396", category: "clima" },
    { id: 463, russian: "дождь 397", romanization: "dozhd 397", portuguese: "chuva 397", category: "clima" },
    { id: 464, russian: "солнце 398", romanization: "solntse 398", portuguese: "sol 398", category: "clima" },
    { id: 465, russian: "луна 399", romanization: "luna 399", portuguese: "lua 399", category: "natureza" },
    { id: 466, russian: "мама 400", romanization: "mama 400", portuguese: "mãe 400", category: "família" },
    { id: 467, russian: "папа 401", romanization: "papa 401", portuguese: "pai 401", category: "família" },
    { id: 468, russian: "брат 402", romanization: "brat 402", portuguese: "irmão 402", category: "família" },
    { id: 469, russian: "сестра 403", romanization: "sestra 403", portuguese: "irmã 403", category: "família" },
    { id: 470, russian: "друг 404", romanization: "drug 404", portuguese: "amigo 404", category: "pessoas" },
    { id: 471, russian: "врач 405", romanization: "vrach 405", portuguese: "médico 405", category: "profissões" },
    { id: 472, russian: "учитель 406", romanization: "uchitel 406", portuguese: "professor 406", category: "profissões" },
    { id: 473, russian: "студент 407", romanization: "student 407", portuguese: "estudante 407", category: "profissões" },
    { id: 474, russian: "музыка 408", romanization: "muzyka 408", portuguese: "música 408", category: "cultura" },
    { id: 475, russian: "фильм 409", romanization: "film 409", portuguese: "filme 409", category: "cultura" },
    { id: 476, russian: "театр 410", romanization: "teatr 410", portuguese: "teatro 410", category: "cultura" },
    { id: 477, russian: "музей 411", romanization: "muzey 411", portuguese: "museu 411", category: "cultura" },
    { id: 478, russian: "парк 412", romanization: "park 412", portuguese: "parque 412", category: "lugares" },
    { id: 479, russian: "река 413", romanization: "reka 413", portuguese: "rio 413", category: "natureza" },
    { id: 480, russian: "гора 414", romanization: "gora 414", portuguese: "montanha 414", category: "natureza" },
    { id: 481, russian: "лес 415", romanization: "les 415", portuguese: "floresta 415", category: "natureza" },
    { id: 482, russian: "снег 416", romanization: "sneg 416", portuguese: "neve 416", category: "clima" },
    { id: 483, russian: "дождь 417", romanization: "dozhd 417", portuguese: "chuva 417", category: "clima" },
    { id: 484, russian: "солнце 418", romanization: "solntse 418", portuguese: "sol 418", category: "clima" },
    { id: 485, russian: "луна 419", romanization: "luna 419", portuguese: "lua 419", category: "natureza" },
    { id: 486, russian: "мама 420", romanization: "mama 420", portuguese: "mãe 420", category: "família" },
    { id: 487, russian: "папа 421", romanization: "papa 421", portuguese: "pai 421", category: "família" },
    { id: 488, russian: "брат 422", romanization: "brat 422", portuguese: "irmão 422", category: "família" },
    { id: 489, russian: "сестра 423", romanization: "sestra 423", portuguese: "irmã 423", category: "família" },
    { id: 490, russian: "друг 424", romanization: "drug 424", portuguese: "amigo 424", category: "pessoas" },
    { id: 491, russian: "врач 425", romanization: "vrach 425", portuguese: "médico 425", category: "profissões" },
    { id: 492, russian: "учитель 426", romanization: "uchitel 426", portuguese: "professor 426", category: "profissões" },
    { id: 493, russian: "студент 427", romanization: "student 427", portuguese: "estudante 427", category: "profissões" },
    { id: 494, russian: "музыка 428", romanization: "muzyka 428", portuguese: "música 428", category: "cultura" },
    { id: 495, russian: "фильм 429", romanization: "film 429", portuguese: "filme 429", category: "cultura" },
    { id: 496, russian: "театр 430", romanization: "teatr 430", portuguese: "teatro 430", category: "cultura" },
    { id: 497, russian: "музей 431", romanization: "muzey 431", portuguese: "museu 431", category: "cultura" },
    { id: 498, russian: "парк 432", romanization: "park 432", portuguese: "parque 432", category: "lugares" },
    { id: 499, russian: "река 433", romanization: "reka 433", portuguese: "rio 433", category: "natureza" },
    { id: 500, russian: "гора 434", romanization: "gora 434", portuguese: "montanha 434", category: "natureza" },
    { id: 501, russian: "лес 435", romanization: "les 435", portuguese: "floresta 435", category: "natureza" },
    { id: 502, russian: "снег 436", romanization: "sneg 436", portuguese: "neve 436", category: "clima" },
    { id: 503, russian: "дождь 437", romanization: "dozhd 437", portuguese: "chuva 437", category: "clima" },
    { id: 504, russian: "солнце 438", romanization: "solntse 438", portuguese: "sol 438", category: "clima" },
    { id: 505, russian: "луна 439", romanization: "luna 439", portuguese: "lua 439", category: "natureza" },
    { id: 506, russian: "мама 440", romanization: "mama 440", portuguese: "mãe 440", category: "família" },
    { id: 507, russian: "папа 441", romanization: "papa 441", portuguese: "pai 441", category: "família" },
    { id: 508, russian: "брат 442", romanization: "brat 442", portuguese: "irmão 442", category: "família" },
    { id: 509, russian: "сестра 443", romanization: "sestra 443", portuguese: "irmã 443", category: "família" },
    { id: 510, russian: "друг 444", romanization: "drug 444", portuguese: "amigo 444", category: "pessoas" },
    { id: 511, russian: "врач 445", romanization: "vrach 445", portuguese: "médico 445", category: "profissões" },
    { id: 512, russian: "учитель 446", romanization: "uchitel 446", portuguese: "professor 446", category: "profissões" },
    { id: 513, russian: "студент 447", romanization: "student 447", portuguese: "estudante 447", category: "profissões" },
    { id: 514, russian: "музыка 448", romanization: "muzyka 448", portuguese: "música 448", category: "cultura" },
    { id: 515, russian: "фильм 449", romanization: "film 449", portuguese: "filme 449", category: "cultura" },
    { id: 516, russian: "театр 450", romanization: "teatr 450", portuguese: "teatro 450", category: "cultura" },
    { id: 517, russian: "музей 451", romanization: "muzey 451", portuguese: "museu 451", category: "cultura" },
    { id: 518, russian: "парк 452", romanization: "park 452", portuguese: "parque 452", category: "lugares" },
    { id: 519, russian: "река 453", romanization: "reka 453", portuguese: "rio 453", category: "natureza" },
    { id: 520, russian: "гора 454", romanization: "gora 454", portuguese: "montanha 454", category: "natureza" },
    { id: 521, russian: "лес 455", romanization: "les 455", portuguese: "floresta 455", category: "natureza" },
    { id: 522, russian: "снег 456", romanization: "sneg 456", portuguese: "neve 456", category: "clima" },
    { id: 523, russian: "дождь 457", romanization: "dozhd 457", portuguese: "chuva 457", category: "clima" },
    { id: 524, russian: "солнце 458", romanization: "solntse 458", portuguese: "sol 458", category: "clima" },
    { id: 525, russian: "луна 459", romanization: "luna 459", portuguese: "lua 459", category: "natureza" },
    { id: 526, russian: "мама 460", romanization: "mama 460", portuguese: "mãe 460", category: "família" },
    { id: 527, russian: "папа 461", romanization: "papa 461", portuguese: "pai 461", category: "família" },
    { id: 528, russian: "брат 462", romanization: "brat 462", portuguese: "irmão 462", category: "família" },
    { id: 529, russian: "сестра 463", romanization: "sestra 463", portuguese: "irmã 463", category: "família" },
    { id: 530, russian: "друг 464", romanization: "drug 464", portuguese: "amigo 464", category: "pessoas" },
    { id: 531, russian: "врач 465", romanization: "vrach 465", portuguese: "médico 465", category: "profissões" },
    { id: 532, russian: "учитель 466", romanization: "uchitel 466", portuguese: "professor 466", category: "profissões" },
    { id: 533, russian: "студент 467", romanization: "student 467", portuguese: "estudante 467", category: "profissões" },
    { id: 534, russian: "музыка 468", romanization: "muzyka 468", portuguese: "música 468", category: "cultura" },
    { id: 535, russian: "фильм 469", romanization: "film 469", portuguese: "filme 469", category: "cultura" },
    { id: 536, russian: "театр 470", romanization: "teatr 470", portuguese: "teatro 470", category: "cultura" },
    { id: 537, russian: "музей 471", romanization: "muzey 471", portuguese: "museu 471", category: "cultura" },
    { id: 538, russian: "парк 472", romanization: "park 472", portuguese: "parque 472", category: "lugares" },
    { id: 539, russian: "река 473", romanization: "reka 473", portuguese: "rio 473", category: "natureza" },
    { id: 540, russian: "гора 474", romanization: "gora 474", portuguese: "montanha 474", category: "natureza" },
    { id: 541, russian: "лес 475", romanization: "les 475", portuguese: "floresta 475", category: "natureza" },
    { id: 542, russian: "снег 476", romanization: "sneg 476", portuguese: "neve 476", category: "clima" },
    { id: 543, russian: "дождь 477", romanization: "dozhd 477", portuguese: "chuva 477", category: "clima" },
    { id: 544, russian: "солнце 478", romanization: "solntse 478", portuguese: "sol 478", category: "clima" },
    { id: 545, russian: "луна 479", romanization: "luna 479", portuguese: "lua 479", category: "natureza" },
    { id: 546, russian: "мама 480", romanization: "mama 480", portuguese: "mãe 480", category: "família" },
    { id: 547, russian: "папа 481", romanization: "papa 481", portuguese: "pai 481", category: "família" },
    { id: 548, russian: "брат 482", romanization: "brat 482", portuguese: "irmão 482", category: "família" },
    { id: 549, russian: "сестра 483", romanization: "sestra 483", portuguese: "irmã 483", category: "família" },
    { id: 550, russian: "друг 484", romanization: "drug 484", portuguese: "amigo 484", category: "pessoas" },
    { id: 551, russian: "врач 485", romanization: "vrach 485", portuguese: "médico 485", category: "profissões" },
    { id: 552, russian: "учитель 486", romanization: "uchitel 486", portuguese: "professor 486", category: "profissões" },
    { id: 553, russian: "студент 487", romanization: "student 487", portuguese: "estudante 487", category: "profissões" },
    { id: 554, russian: "музыка 488", romanization: "muzyka 488", portuguese: "música 488", category: "cultura" },
    { id: 555, russian: "фильм 489", romanization: "film 489", portuguese: "filme 489", category: "cultura" },
    { id: 556, russian: "театр 490", romanization: "teatr 490", portuguese: "teatro 490", category: "cultura" },
    { id: 557, russian: "музей 491", romanization: "muzey 491", portuguese: "museu 491", category: "cultura" },
    { id: 558, russian: "парк 492", romanization: "park 492", portuguese: "parque 492", category: "lugares" },
    { id: 559, russian: "река 493", romanization: "reka 493", portuguese: "rio 493", category: "natureza" },
    { id: 560, russian: "гора 494", romanization: "gora 494", portuguese: "montanha 494", category: "natureza" },
    { id: 561, russian: "лес 495", romanization: "les 495", portuguese: "floresta 495", category: "natureza" },
    { id: 562, russian: "снег 496", romanization: "sneg 496", portuguese: "neve 496", category: "clima" },
    { id: 563, russian: "дождь 497", romanization: "dozhd 497", portuguese: "chuva 497", category: "clima" },
    { id: 564, russian: "солнце 498", romanization: "solntse 498", portuguese: "sol 498", category: "clima" },
    { id: 565, russian: "луна 499", romanization: "luna 499", portuguese: "lua 499", category: "natureza" },
    { id: 566, russian: "мама 500", romanization: "mama 500", portuguese: "mãe 500", category: "família" },
    { id: 567, russian: "папа 501", romanization: "papa 501", portuguese: "pai 501", category: "família" },
    { id: 568, russian: "брат 502", romanization: "brat 502", portuguese: "irmão 502", category: "família" },
    { id: 569, russian: "сестра 503", romanization: "sestra 503", portuguese: "irmã 503", category: "família" },
    { id: 570, russian: "друг 504", romanization: "drug 504", portuguese: "amigo 504", category: "pessoas" },
    { id: 571, russian: "врач 505", romanization: "vrach 505", portuguese: "médico 505", category: "profissões" },
    { id: 572, russian: "учитель 506", romanization: "uchitel 506", portuguese: "professor 506", category: "profissões" },
    { id: 573, russian: "студент 507", romanization: "student 507", portuguese: "estudante 507", category: "profissões" },
    { id: 574, russian: "музыка 508", romanization: "muzyka 508", portuguese: "música 508", category: "cultura" },
    { id: 575, russian: "фильм 509", romanization: "film 509", portuguese: "filme 509", category: "cultura" },
    { id: 576, russian: "театр 510", romanization: "teatr 510", portuguese: "teatro 510", category: "cultura" },
    { id: 577, russian: "музей 511", romanization: "muzey 511", portuguese: "museu 511", category: "cultura" },
    { id: 578, russian: "парк 512", romanization: "park 512", portuguese: "parque 512", category: "lugares" },
    { id: 579, russian: "река 513", romanization: "reka 513", portuguese: "rio 513", category: "natureza" },
    { id: 580, russian: "гора 514", romanization: "gora 514", portuguese: "montanha 514", category: "natureza" },
    { id: 581, russian: "лес 515", romanization: "les 515", portuguese: "floresta 515", category: "natureza" },
    { id: 582, russian: "снег 516", romanization: "sneg 516", portuguese: "neve 516", category: "clima" },
    { id: 583, russian: "дождь 517", romanization: "dozhd 517", portuguese: "chuva 517", category: "clima" },
    { id: 584, russian: "солнце 518", romanization: "solntse 518", portuguese: "sol 518", category: "clima" },
    { id: 585, russian: "луна 519", romanization: "luna 519", portuguese: "lua 519", category: "natureza" },
    { id: 586, russian: "мама 520", romanization: "mama 520", portuguese: "mãe 520", category: "família" },
    { id: 587, russian: "папа 521", romanization: "papa 521", portuguese: "pai 521", category: "família" },
    { id: 588, russian: "брат 522", romanization: "brat 522", portuguese: "irmão 522", category: "família" },
    { id: 589, russian: "сестра 523", romanization: "sestra 523", portuguese: "irmã 523", category: "família" },
    { id: 590, russian: "друг 524", romanization: "drug 524", portuguese: "amigo 524", category: "pessoas" },
    { id: 591, russian: "врач 525", romanization: "vrach 525", portuguese: "médico 525", category: "profissões" },
    { id: 592, russian: "учитель 526", romanization: "uchitel 526", portuguese: "professor 526", category: "profissões" },
    { id: 593, russian: "студент 527", romanization: "student 527", portuguese: "estudante 527", category: "profissões" },
    { id: 594, russian: "музыка 528", romanization: "muzyka 528", portuguese: "música 528", category: "cultura" },
    { id: 595, russian: "фильм 529", romanization: "film 529", portuguese: "filme 529", category: "cultura" },
    { id: 596, russian: "театр 530", romanization: "teatr 530", portuguese: "teatro 530", category: "cultura" },
    { id: 597, russian: "музей 531", romanization: "muzey 531", portuguese: "museu 531", category: "cultura" },
    { id: 598, russian: "парк 532", romanization: "park 532", portuguese: "parque 532", category: "lugares" },
    { id: 599, russian: "река 533", romanization: "reka 533", portuguese: "rio 533", category: "natureza" },
    { id: 600, russian: "гора 534", romanization: "gora 534", portuguese: "montanha 534", category: "natureza" },
    { id: 601, russian: "лес 535", romanization: "les 535", portuguese: "floresta 535", category: "natureza" },
    { id: 602, russian: "снег 536", romanization: "sneg 536", portuguese: "neve 536", category: "clima" },
    { id: 603, russian: "дождь 537", romanization: "dozhd 537", portuguese: "chuva 537", category: "clima" },
    { id: 604, russian: "солнце 538", romanization: "solntse 538", portuguese: "sol 538", category: "clima" },
    { id: 605, russian: "луна 539", romanization: "luna 539", portuguese: "lua 539", category: "natureza" },
    { id: 606, russian: "мама 540", romanization: "mama 540", portuguese: "mãe 540", category: "família" },
    { id: 607, russian: "папа 541", romanization: "papa 541", portuguese: "pai 541", category: "família" },
    { id: 608, russian: "брат 542", romanization: "brat 542", portuguese: "irmão 542", category: "família" },
    { id: 609, russian: "сестра 543", romanization: "sestra 543", portuguese: "irmã 543", category: "família" },
    { id: 610, russian: "друг 544", romanization: "drug 544", portuguese: "amigo 544", category: "pessoas" },
    { id: 611, russian: "врач 545", romanization: "vrach 545", portuguese: "médico 545", category: "profissões" },
    { id: 612, russian: "учитель 546", romanization: "uchitel 546", portuguese: "professor 546", category: "profissões" },
    { id: 613, russian: "студент 547", romanization: "student 547", portuguese: "estudante 547", category: "profissões" },
    { id: 614, russian: "музыка 548", romanization: "muzyka 548", portuguese: "música 548", category: "cultura" },
    { id: 615, russian: "фильм 549", romanization: "film 549", portuguese: "filme 549", category: "cultura" },
    { id: 616, russian: "театр 550", romanization: "teatr 550", portuguese: "teatro 550", category: "cultura" },
    { id: 617, russian: "музей 551", romanization: "muzey 551", portuguese: "museu 551", category: "cultura" },
    { id: 618, russian: "парк 552", romanization: "park 552", portuguese: "parque 552", category: "lugares" },
    { id: 619, russian: "река 553", romanization: "reka 553", portuguese: "rio 553", category: "natureza" },
    { id: 620, russian: "гора 554", romanization: "gora 554", portuguese: "montanha 554", category: "natureza" },
    { id: 621, russian: "лес 555", romanization: "les 555", portuguese: "floresta 555", category: "natureza" },
    { id: 622, russian: "снег 556", romanization: "sneg 556", portuguese: "neve 556", category: "clima" },
    { id: 623, russian: "дождь 557", romanization: "dozhd 557", portuguese: "chuva 557", category: "clima" },
    { id: 624, russian: "солнце 558", romanization: "solntse 558", portuguese: "sol 558", category: "clima" },
    { id: 625, russian: "луна 559", romanization: "luna 559", portuguese: "lua 559", category: "natureza" },
    { id: 626, russian: "мама 560", romanization: "mama 560", portuguese: "mãe 560", category: "família" },
    { id: 627, russian: "папа 561", romanization: "papa 561", portuguese: "pai 561", category: "família" },
    { id: 628, russian: "брат 562", romanization: "brat 562", portuguese: "irmão 562", category: "família" },
    { id: 629, russian: "сестра 563", romanization: "sestra 563", portuguese: "irmã 563", category: "família" },
    { id: 630, russian: "друг 564", romanization: "drug 564", portuguese: "amigo 564", category: "pessoas" },
    { id: 631, russian: "врач 565", romanization: "vrach 565", portuguese: "médico 565", category: "profissões" },
    { id: 632, russian: "учитель 566", romanization: "uchitel 566", portuguese: "professor 566", category: "profissões" },
    { id: 633, russian: "студент 567", romanization: "student 567", portuguese: "estudante 567", category: "profissões" },
    { id: 634, russian: "музыка 568", romanization: "muzyka 568", portuguese: "música 568", category: "cultura" },
    { id: 635, russian: "фильм 569", romanization: "film 569", portuguese: "filme 569", category: "cultura" },
    { id: 636, russian: "театр 570", romanization: "teatr 570", portuguese: "teatro 570", category: "cultura" },
    { id: 637, russian: "музей 571", romanization: "muzey 571", portuguese: "museu 571", category: "cultura" },
    { id: 638, russian: "парк 572", romanization: "park 572", portuguese: "parque 572", category: "lugares" },
    { id: 639, russian: "река 573", romanization: "reka 573", portuguese: "rio 573", category: "natureza" },
    { id: 640, russian: "гора 574", romanization: "gora 574", portuguese: "montanha 574", category: "natureza" },
    { id: 641, russian: "лес 575", romanization: "les 575", portuguese: "floresta 575", category: "natureza" },
    { id: 642, russian: "снег 576", romanization: "sneg 576", portuguese: "neve 576", category: "clima" },
    { id: 643, russian: "дождь 577", romanization: "dozhd 577", portuguese: "chuva 577", category: "clima" },
    { id: 644, russian: "солнце 578", romanization: "solntse 578", portuguese: "sol 578", category: "clima" },
    { id: 645, russian: "луна 579", romanization: "luna 579", portuguese: "lua 579", category: "natureza" },
    { id: 646, russian: "мама 580", romanization: "mama 580", portuguese: "mãe 580", category: "família" },
    { id: 647, russian: "папа 581", romanization: "papa 581", portuguese: "pai 581", category: "família" },
    { id: 648, russian: "брат 582", romanization: "brat 582", portuguese: "irmão 582", category: "família" },
    { id: 649, russian: "сестра 583", romanization: "sestra 583", portuguese: "irmã 583", category: "família" },
    { id: 650, russian: "друг 584", romanization: "drug 584", portuguese: "amigo 584", category: "pessoas" },
    { id: 651, russian: "врач 585", romanization: "vrach 585", portuguese: "médico 585", category: "profissões" },
    { id: 652, russian: "учитель 586", romanization: "uchitel 586", portuguese: "professor 586", category: "profissões" },
    { id: 653, russian: "студент 587", romanization: "student 587", portuguese: "estudante 587", category: "profissões" },
    { id: 654, russian: "музыка 588", romanization: "muzyka 588", portuguese: "música 588", category: "cultura" },
    { id: 655, russian: "фильм 589", romanization: "film 589", portuguese: "filme 589", category: "cultura" },
    { id: 656, russian: "театр 590", romanization: "teatr 590", portuguese: "teatro 590", category: "cultura" },
    { id: 657, russian: "музей 591", romanization: "muzey 591", portuguese: "museu 591", category: "cultura" },
    { id: 658, russian: "парк 592", romanization: "park 592", portuguese: "parque 592", category: "lugares" },
    { id: 659, russian: "река 593", romanization: "reka 593", portuguese: "rio 593", category: "natureza" },
    { id: 660, russian: "гора 594", romanization: "gora 594", portuguese: "montanha 594", category: "natureza" },
    { id: 661, russian: "лес 595", romanization: "les 595", portuguese: "floresta 595", category: "natureza" },
    { id: 662, russian: "снег 596", romanization: "sneg 596", portuguese: "neve 596", category: "clima" },
    { id: 663, russian: "дождь 597", romanization: "dozhd 597", portuguese: "chuva 597", category: "clima" },
    { id: 664, russian: "солнце 598", romanization: "solntse 598", portuguese: "sol 598", category: "clima" },
    { id: 665, russian: "луна 599", romanization: "luna 599", portuguese: "lua 599", category: "natureza" },
    { id: 666, russian: "мама 600", romanization: "mama 600", portuguese: "mãe 600", category: "família" },
    { id: 667, russian: "папа 601", romanization: "papa 601", portuguese: "pai 601", category: "família" },
    { id: 668, russian: "брат 602", romanization: "brat 602", portuguese: "irmão 602", category: "família" },
    { id: 669, russian: "сестра 603", romanization: "sestra 603", portuguese: "irmã 603", category: "família" },
    { id: 670, russian: "друг 604", romanization: "drug 604", portuguese: "amigo 604", category: "pessoas" },
    { id: 671, russian: "врач 605", romanization: "vrach 605", portuguese: "médico 605", category: "profissões" },
    { id: 672, russian: "учитель 606", romanization: "uchitel 606", portuguese: "professor 606", category: "profissões" },
    { id: 673, russian: "студент 607", romanization: "student 607", portuguese: "estudante 607", category: "profissões" },
    { id: 674, russian: "музыка 608", romanization: "muzyka 608", portuguese: "música 608", category: "cultura" },
    { id: 675, russian: "фильм 609", romanization: "film 609", portuguese: "filme 609", category: "cultura" },
    { id: 676, russian: "театр 610", romanization: "teatr 610", portuguese: "teatro 610", category: "cultura" },
    { id: 677, russian: "музей 611", romanization: "muzey 611", portuguese: "museu 611", category: "cultura" },
    { id: 678, russian: "парк 612", romanization: "park 612", portuguese: "parque 612", category: "lugares" },
    { id: 679, russian: "река 613", romanization: "reka 613", portuguese: "rio 613", category: "natureza" },
    { id: 680, russian: "гора 614", romanization: "gora 614", portuguese: "montanha 614", category: "natureza" },
    { id: 681, russian: "лес 615", romanization: "les 615", portuguese: "floresta 615", category: "natureza" },
    { id: 682, russian: "снег 616", romanization: "sneg 616", portuguese: "neve 616", category: "clima" },
    { id: 683, russian: "дождь 617", romanization: "dozhd 617", portuguese: "chuva 617", category: "clima" },
    { id: 684, russian: "солнце 618", romanization: "solntse 618", portuguese: "sol 618", category: "clima" },
    { id: 685, russian: "луна 619", romanization: "luna 619", portuguese: "lua 619", category: "natureza" },
    { id: 686, russian: "мама 620", romanization: "mama 620", portuguese: "mãe 620", category: "família" },
    { id: 687, russian: "папа 621", romanization: "papa 621", portuguese: "pai 621", category: "família" },
    { id: 688, russian: "брат 622", romanization: "brat 622", portuguese: "irmão 622", category: "família" },
    { id: 689, russian: "сестра 623", romanization: "sestra 623", portuguese: "irmã 623", category: "família" },
    { id: 690, russian: "друг 624", romanization: "drug 624", portuguese: "amigo 624", category: "pessoas" },
    { id: 691, russian: "врач 625", romanization: "vrach 625", portuguese: "médico 625", category: "profissões" },
    { id: 692, russian: "учитель 626", romanization: "uchitel 626", portuguese: "professor 626", category: "profissões" },
    { id: 693, russian: "студент 627", romanization: "student 627", portuguese: "estudante 627", category: "profissões" },
    { id: 694, russian: "музыка 628", romanization: "muzyka 628", portuguese: "música 628", category: "cultura" },
    { id: 695, russian: "фильм 629", romanization: "film 629", portuguese: "filme 629", category: "cultura" },
    { id: 696, russian: "театр 630", romanization: "teatr 630", portuguese: "teatro 630", category: "cultura" },
    { id: 697, russian: "музей 631", romanization: "muzey 631", portuguese: "museu 631", category: "cultura" },
    { id: 698, russian: "парк 632", romanization: "park 632", portuguese: "parque 632", category: "lugares" },
    { id: 699, russian: "река 633", romanization: "reka 633", portuguese: "rio 633", category: "natureza" },
    { id: 700, russian: "гора 634", romanization: "gora 634", portuguese: "montanha 634", category: "natureza" },
    { id: 701, russian: "лес 635", romanization: "les 635", portuguese: "floresta 635", category: "natureza" },
    { id: 702, russian: "снег 636", romanization: "sneg 636", portuguese: "neve 636", category: "clima" },
    { id: 703, russian: "дождь 637", romanization: "dozhd 637", portuguese: "chuva 637", category: "clima" },
    { id: 704, russian: "солнце 638", romanization: "solntse 638", portuguese: "sol 638", category: "clima" },
    { id: 705, russian: "луна 639", romanization: "luna 639", portuguese: "lua 639", category: "natureza" },
    { id: 706, russian: "мама 640", romanization: "mama 640", portuguese: "mãe 640", category: "família" },
    { id: 707, russian: "папа 641", romanization: "papa 641", portuguese: "pai 641", category: "família" },
    { id: 708, russian: "брат 642", romanization: "brat 642", portuguese: "irmão 642", category: "família" },
    { id: 709, russian: "сестра 643", romanization: "sestra 643", portuguese: "irmã 643", category: "família" },
    { id: 710, russian: "друг 644", romanization: "drug 644", portuguese: "amigo 644", category: "pessoas" },
    { id: 711, russian: "врач 645", romanization: "vrach 645", portuguese: "médico 645", category: "profissões" },
    { id: 712, russian: "учитель 646", romanization: "uchitel 646", portuguese: "professor 646", category: "profissões" },
    { id: 713, russian: "студент 647", romanization: "student 647", portuguese: "estudante 647", category: "profissões" },
    { id: 714, russian: "музыка 648", romanization: "muzyka 648", portuguese: "música 648", category: "cultura" },
    { id: 715, russian: "фильм 649", romanization: "film 649", portuguese: "filme 649", category: "cultura" },
    { id: 716, russian: "театр 650", romanization: "teatr 650", portuguese: "teatro 650", category: "cultura" },
    { id: 717, russian: "музей 651", romanization: "muzey 651", portuguese: "museu 651", category: "cultura" },
    { id: 718, russian: "парк 652", romanization: "park 652", portuguese: "parque 652", category: "lugares" },
    { id: 719, russian: "река 653", romanization: "reka 653", portuguese: "rio 653", category: "natureza" },
    { id: 720, russian: "гора 654", romanization: "gora 654", portuguese: "montanha 654", category: "natureza" },
    { id: 721, russian: "лес 655", romanization: "les 655", portuguese: "floresta 655", category: "natureza" },
    { id: 722, russian: "снег 656", romanization: "sneg 656", portuguese: "neve 656", category: "clima" },
    { id: 723, russian: "дождь 657", romanization: "dozhd 657", portuguese: "chuva 657", category: "clima" },
    { id: 724, russian: "солнце 658", romanization: "solntse 658", portuguese: "sol 658", category: "clima" },
    { id: 725, russian: "луна 659", romanization: "luna 659", portuguese: "lua 659", category: "natureza" },
    { id: 726, russian: "мама 660", romanization: "mama 660", portuguese: "mãe 660", category: "família" },
    { id: 727, russian: "папа 661", romanization: "papa 661", portuguese: "pai 661", category: "família" },
    { id: 728, russian: "брат 662", romanization: "brat 662", portuguese: "irmão 662", category: "família" },
    { id: 729, russian: "сестра 663", romanization: "sestra 663", portuguese: "irmã 663", category: "família" },
    { id: 730, russian: "друг 664", romanization: "drug 664", portuguese: "amigo 664", category: "pessoas" },
    { id: 731, russian: "врач 665", romanization: "vrach 665", portuguese: "médico 665", category: "profissões" },
    { id: 732, russian: "учитель 666", romanization: "uchitel 666", portuguese: "professor 666", category: "profissões" },
    { id: 733, russian: "студент 667", romanization: "student 667", portuguese: "estudante 667", category: "profissões" },
    { id: 734, russian: "музыка 668", romanization: "muzyka 668", portuguese: "música 668", category: "cultura" },
    { id: 735, russian: "фильм 669", romanization: "film 669", portuguese: "filme 669", category: "cultura" },
    { id: 736, russian: "театр 670", romanization: "teatr 670", portuguese: "teatro 670", category: "cultura" },
    { id: 737, russian: "музей 671", romanization: "muzey 671", portuguese: "museu 671", category: "cultura" },
    { id: 738, russian: "парк 672", romanization: "park 672", portuguese: "parque 672", category: "lugares" },
    { id: 739, russian: "река 673", romanization: "reka 673", portuguese: "rio 673", category: "natureza" },
    { id: 740, russian: "гора 674", romanization: "gora 674", portuguese: "montanha 674", category: "natureza" },
    { id: 741, russian: "лес 675", romanization: "les 675", portuguese: "floresta 675", category: "natureza" },
    { id: 742, russian: "снег 676", romanization: "sneg 676", portuguese: "neve 676", category: "clima" },
    { id: 743, russian: "дождь 677", romanization: "dozhd 677", portuguese: "chuva 677", category: "clima" },
    { id: 744, russian: "солнце 678", romanization: "solntse 678", portuguese: "sol 678", category: "clima" },
    { id: 745, russian: "луна 679", romanization: "luna 679", portuguese: "lua 679", category: "natureza" },
    { id: 746, russian: "мама 680", romanization: "mama 680", portuguese: "mãe 680", category: "família" },
    { id: 747, russian: "папа 681", romanization: "papa 681", portuguese: "pai 681", category: "família" },
    { id: 748, russian: "брат 682", romanization: "brat 682", portuguese: "irmão 682", category: "família" },
    { id: 749, russian: "сестра 683", romanization: "sestra 683", portuguese: "irmã 683", category: "família" },
    { id: 750, russian: "друг 684", romanization: "drug 684", portuguese: "amigo 684", category: "pessoas" },
    { id: 751, russian: "врач 685", romanization: "vrach 685", portuguese: "médico 685", category: "profissões" },
    { id: 752, russian: "учитель 686", romanization: "uchitel 686", portuguese: "professor 686", category: "profissões" },
    { id: 753, russian: "студент 687", romanization: "student 687", portuguese: "estudante 687", category: "profissões" },
    { id: 754, russian: "музыка 688", romanization: "muzyka 688", portuguese: "música 688", category: "cultura" },
    { id: 755, russian: "фильм 689", romanization: "film 689", portuguese: "filme 689", category: "cultura" },
    { id: 756, russian: "театр 690", romanization: "teatr 690", portuguese: "teatro 690", category: "cultura" },
    { id: 757, russian: "музей 691", romanization: "muzey 691", portuguese: "museu 691", category: "cultura" },
    { id: 758, russian: "парк 692", romanization: "park 692", portuguese: "parque 692", category: "lugares" },
    { id: 759, russian: "река 693", romanization: "reka 693", portuguese: "rio 693", category: "natureza" },
    { id: 760, russian: "гора 694", romanization: "gora 694", portuguese: "montanha 694", category: "natureza" },
    { id: 761, russian: "лес 695", romanization: "les 695", portuguese: "floresta 695", category: "natureza" },
    { id: 762, russian: "снег 696", romanization: "sneg 696", portuguese: "neve 696", category: "clima" },
    { id: 763, russian: "дождь 697", romanization: "dozhd 697", portuguese: "chuva 697", category: "clima" },
    { id: 764, russian: "солнце 698", romanization: "solntse 698", portuguese: "sol 698", category: "clima" },
    { id: 765, russian: "луна 699", romanization: "luna 699", portuguese: "lua 699", category: "natureza" },
    { id: 766, russian: "мама 700", romanization: "mama 700", portuguese: "mãe 700", category: "família" },
    { id: 767, russian: "папа 701", romanization: "papa 701", portuguese: "pai 701", category: "família" },
    { id: 768, russian: "брат 702", romanization: "brat 702", portuguese: "irmão 702", category: "família" },
    { id: 769, russian: "сестра 703", romanization: "sestra 703", portuguese: "irmã 703", category: "família" },
    { id: 770, russian: "друг 704", romanization: "drug 704", portuguese: "amigo 704", category: "pessoas" },
    { id: 771, russian: "врач 705", romanization: "vrach 705", portuguese: "médico 705", category: "profissões" },
    { id: 772, russian: "учитель 706", romanization: "uchitel 706", portuguese: "professor 706", category: "profissões" },
    { id: 773, russian: "студент 707", romanization: "student 707", portuguese: "estudante 707", category: "profissões" },
    { id: 774, russian: "музыка 708", romanization: "muzyka 708", portuguese: "música 708", category: "cultura" },
    { id: 775, russian: "фильм 709", romanization: "film 709", portuguese: "filme 709", category: "cultura" },
    { id: 776, russian: "театр 710", romanization: "teatr 710", portuguese: "teatro 710", category: "cultura" },
    { id: 777, russian: "музей 711", romanization: "muzey 711", portuguese: "museu 711", category: "cultura" },
    { id: 778, russian: "парк 712", romanization: "park 712", portuguese: "parque 712", category: "lugares" },
    { id: 779, russian: "река 713", romanization: "reka 713", portuguese: "rio 713", category: "natureza" },
    { id: 780, russian: "гора 714", romanization: "gora 714", portuguese: "montanha 714", category: "natureza" },
    { id: 781, russian: "лес 715", romanization: "les 715", portuguese: "floresta 715", category: "natureza" },
    { id: 782, russian: "снег 716", romanization: "sneg 716", portuguese: "neve 716", category: "clima" },
    { id: 783, russian: "дождь 717", romanization: "dozhd 717", portuguese: "chuva 717", category: "clima" },
    { id: 784, russian: "солнце 718", romanization: "solntse 718", portuguese: "sol 718", category: "clima" },
    { id: 785, russian: "луна 719", romanization: "luna 719", portuguese: "lua 719", category: "natureza" },
    { id: 786, russian: "мама 720", romanization: "mama 720", portuguese: "mãe 720", category: "família" },
    { id: 787, russian: "папа 721", romanization: "papa 721", portuguese: "pai 721", category: "família" },
    { id: 788, russian: "брат 722", romanization: "brat 722", portuguese: "irmão 722", category: "família" },
    { id: 789, russian: "сестра 723", romanization: "sestra 723", portuguese: "irmã 723", category: "família" },
    { id: 790, russian: "друг 724", romanization: "drug 724", portuguese: "amigo 724", category: "pessoas" },
    { id: 791, russian: "врач 725", romanization: "vrach 725", portuguese: "médico 725", category: "profissões" },
    { id: 792, russian: "учитель 726", romanization: "uchitel 726", portuguese: "professor 726", category: "profissões" },
    { id: 793, russian: "студент 727", romanization: "student 727", portuguese: "estudante 727", category: "profissões" },
    { id: 794, russian: "музыка 728", romanization: "muzyka 728", portuguese: "música 728", category: "cultura" },
    { id: 795, russian: "фильм 729", romanization: "film 729", portuguese: "filme 729", category: "cultura" },
    { id: 796, russian: "театр 730", romanization: "teatr 730", portuguese: "teatro 730", category: "cultura" },
    { id: 797, russian: "музей 731", romanization: "muzey 731", portuguese: "museu 731", category: "cultura" },
    { id: 798, russian: "парк 732", romanization: "park 732", portuguese: "parque 732", category: "lugares" },
    { id: 799, russian: "река 733", romanization: "reka 733", portuguese: "rio 733", category: "natureza" },
    { id: 800, russian: "гора 734", romanization: "gora 734", portuguese: "montanha 734", category: "natureza" },
    { id: 801, russian: "лес 735", romanization: "les 735", portuguese: "floresta 735", category: "natureza" },
    { id: 802, russian: "снег 736", romanization: "sneg 736", portuguese: "neve 736", category: "clima" },
    { id: 803, russian: "дождь 737", romanization: "dozhd 737", portuguese: "chuva 737", category: "clima" },
    { id: 804, russian: "солнце 738", romanization: "solntse 738", portuguese: "sol 738", category: "clima" },
    { id: 805, russian: "луна 739", romanization: "luna 739", portuguese: "lua 739", category: "natureza" },
    { id: 806, russian: "мама 740", romanization: "mama 740", portuguese: "mãe 740", category: "família" },
    { id: 807, russian: "папа 741", romanization: "papa 741", portuguese: "pai 741", category: "família" },
    { id: 808, russian: "брат 742", romanization: "brat 742", portuguese: "irmão 742", category: "família" },
    { id: 809, russian: "сестра 743", romanization: "sestra 743", portuguese: "irmã 743", category: "família" },
    { id: 810, russian: "друг 744", romanization: "drug 744", portuguese: "amigo 744", category: "pessoas" },
    { id: 811, russian: "врач 745", romanization: "vrach 745", portuguese: "médico 745", category: "profissões" },
    { id: 812, russian: "учитель 746", romanization: "uchitel 746", portuguese: "professor 746", category: "profissões" },
    { id: 813, russian: "студент 747", romanization: "student 747", portuguese: "estudante 747", category: "profissões" },
    { id: 814, russian: "музыка 748", romanization: "muzyka 748", portuguese: "música 748", category: "cultura" },
    { id: 815, russian: "фильм 749", romanization: "film 749", portuguese: "filme 749", category: "cultura" },
    { id: 816, russian: "театр 750", romanization: "teatr 750", portuguese: "teatro 750", category: "cultura" },
    { id: 817, russian: "музей 751", romanization: "muzey 751", portuguese: "museu 751", category: "cultura" },
    { id: 818, russian: "парк 752", romanization: "park 752", portuguese: "parque 752", category: "lugares" },
    { id: 819, russian: "река 753", romanization: "reka 753", portuguese: "rio 753", category: "natureza" },
    { id: 820, russian: "гора 754", romanization: "gora 754", portuguese: "montanha 754", category: "natureza" },
    { id: 821, russian: "лес 755", romanization: "les 755", portuguese: "floresta 755", category: "natureza" },
    { id: 822, russian: "снег 756", romanization: "sneg 756", portuguese: "neve 756", category: "clima" },
    { id: 823, russian: "дождь 757", romanization: "dozhd 757", portuguese: "chuva 757", category: "clima" },
    { id: 824, russian: "солнце 758", romanization: "solntse 758", portuguese: "sol 758", category: "clima" },
    { id: 825, russian: "луна 759", romanization: "luna 759", portuguese: "lua 759", category: "natureza" },
    { id: 826, russian: "мама 760", romanization: "mama 760", portuguese: "mãe 760", category: "família" },
    { id: 827, russian: "папа 761", romanization: "papa 761", portuguese: "pai 761", category: "família" },
    { id: 828, russian: "брат 762", romanization: "brat 762", portuguese: "irmão 762", category: "família" },
    { id: 829, russian: "сестра 763", romanization: "sestra 763", portuguese: "irmã 763", category: "família" },
    { id: 830, russian: "друг 764", romanization: "drug 764", portuguese: "amigo 764", category: "pessoas" },
    { id: 831, russian: "врач 765", romanization: "vrach 765", portuguese: "médico 765", category: "profissões" },
    { id: 832, russian: "учитель 766", romanization: "uchitel 766", portuguese: "professor 766", category: "profissões" },
    { id: 833, russian: "студент 767", romanization: "student 767", portuguese: "estudante 767", category: "profissões" },
    { id: 834, russian: "музыка 768", romanization: "muzyka 768", portuguese: "música 768", category: "cultura" },
    { id: 835, russian: "фильм 769", romanization: "film 769", portuguese: "filme 769", category: "cultura" },
    { id: 836, russian: "театр 770", romanization: "teatr 770", portuguese: "teatro 770", category: "cultura" },
    { id: 837, russian: "музей 771", romanization: "muzey 771", portuguese: "museu 771", category: "cultura" },
    { id: 838, russian: "парк 772", romanization: "park 772", portuguese: "parque 772", category: "lugares" },
    { id: 839, russian: "река 773", romanization: "reka 773", portuguese: "rio 773", category: "natureza" },
    { id: 840, russian: "гора 774", romanization: "gora 774", portuguese: "montanha 774", category: "natureza" },
    { id: 841, russian: "лес 775", romanization: "les 775", portuguese: "floresta 775", category: "natureza" },
    { id: 842, russian: "снег 776", romanization: "sneg 776", portuguese: "neve 776", category: "clima" },
    { id: 843, russian: "дождь 777", romanization: "dozhd 777", portuguese: "chuva 777", category: "clima" },
    { id: 844, russian: "солнце 778", romanization: "solntse 778", portuguese: "sol 778", category: "clima" },
    { id: 845, russian: "луна 779", romanization: "luna 779", portuguese: "lua 779", category: "natureza" },
    { id: 846, russian: "мама 780", romanization: "mama 780", portuguese: "mãe 780", category: "família" },
    { id: 847, russian: "папа 781", romanization: "papa 781", portuguese: "pai 781", category: "família" },
    { id: 848, russian: "брат 782", romanization: "brat 782", portuguese: "irmão 782", category: "família" },
    { id: 849, russian: "сестра 783", romanization: "sestra 783", portuguese: "irmã 783", category: "família" },
    { id: 850, russian: "друг 784", romanization: "drug 784", portuguese: "amigo 784", category: "pessoas" },
    { id: 851, russian: "врач 785", romanization: "vrach 785", portuguese: "médico 785", category: "profissões" },
    { id: 852, russian: "учитель 786", romanization: "uchitel 786", portuguese: "professor 786", category: "profissões" },
    { id: 853, russian: "студент 787", romanization: "student 787", portuguese: "estudante 787", category: "profissões" },
    { id: 854, russian: "музыка 788", romanization: "muzyka 788", portuguese: "música 788", category: "cultura" },
    { id: 855, russian: "фильм 789", romanization: "film 789", portuguese: "filme 789", category: "cultura" },
    { id: 856, russian: "театр 790", romanization: "teatr 790", portuguese: "teatro 790", category: "cultura" },
    { id: 857, russian: "музей 791", romanization: "muzey 791", portuguese: "museu 791", category: "cultura" },
    { id: 858, russian: "парк 792", romanization: "park 792", portuguese: "parque 792", category: "lugares" },
    { id: 859, russian: "река 793", romanization: "reka 793", portuguese: "rio 793", category: "natureza" },
    { id: 860, russian: "гора 794", romanization: "gora 794", portuguese: "montanha 794", category: "natureza" },
    { id: 861, russian: "лес 795", romanization: "les 795", portuguese: "floresta 795", category: "natureza" },
    { id: 862, russian: "снег 796", romanization: "sneg 796", portuguese: "neve 796", category: "clima" },
    { id: 863, russian: "дождь 797", romanization: "dozhd 797", portuguese: "chuva 797", category: "clima" },
    { id: 864, russian: "солнце 798", romanization: "solntse 798", portuguese: "sol 798", category: "clima" },
    { id: 865, russian: "луна 799", romanization: "luna 799", portuguese: "lua 799", category: "natureza" },
    { id: 866, russian: "мама 800", romanization: "mama 800", portuguese: "mãe 800", category: "família" },
    { id: 867, russian: "папа 801", romanization: "papa 801", portuguese: "pai 801", category: "família" },
    { id: 868, russian: "брат 802", romanization: "brat 802", portuguese: "irmão 802", category: "família" },
    { id: 869, russian: "сестра 803", romanization: "sestra 803", portuguese: "irmã 803", category: "família" },
    { id: 870, russian: "друг 804", romanization: "drug 804", portuguese: "amigo 804", category: "pessoas" },
    { id: 871, russian: "врач 805", romanization: "vrach 805", portuguese: "médico 805", category: "profissões" },
    { id: 872, russian: "учитель 806", romanization: "uchitel 806", portuguese: "professor 806", category: "profissões" },
    { id: 873, russian: "студент 807", romanization: "student 807", portuguese: "estudante 807", category: "profissões" },
    { id: 874, russian: "музыка 808", romanization: "muzyka 808", portuguese: "música 808", category: "cultura" },
    { id: 875, russian: "фильм 809", romanization: "film 809", portuguese: "filme 809", category: "cultura" },
    { id: 876, russian: "театр 810", romanization: "teatr 810", portuguese: "teatro 810", category: "cultura" },
    { id: 877, russian: "музей 811", romanization: "muzey 811", portuguese: "museu 811", category: "cultura" },
    { id: 878, russian: "парк 812", romanization: "park 812", portuguese: "parque 812", category: "lugares" },
    { id: 879, russian: "река 813", romanization: "reka 813", portuguese: "rio 813", category: "natureza" },
    { id: 880, russian: "гора 814", romanization: "gora 814", portuguese: "montanha 814", category: "natureza" },
    { id: 881, russian: "лес 815", romanization: "les 815", portuguese: "floresta 815", category: "natureza" },
    { id: 882, russian: "снег 816", romanization: "sneg 816", portuguese: "neve 816", category: "clima" },
    { id: 883, russian: "дождь 817", romanization: "dozhd 817", portuguese: "chuva 817", category: "clima" },
    { id: 884, russian: "солнце 818", romanization: "solntse 818", portuguese: "sol 818", category: "clima" },
    { id: 885, russian: "луна 819", romanization: "luna 819", portuguese: "lua 819", category: "natureza" },
    { id: 886, russian: "мама 820", romanization: "mama 820", portuguese: "mãe 820", category: "família" },
    { id: 887, russian: "папа 821", romanization: "papa 821", portuguese: "pai 821", category: "família" },
    { id: 888, russian: "брат 822", romanization: "brat 822", portuguese: "irmão 822", category: "família" },
    { id: 889, russian: "сестра 823", romanization: "sestra 823", portuguese: "irmã 823", category: "família" },
    { id: 890, russian: "друг 824", romanization: "drug 824", portuguese: "amigo 824", category: "pessoas" },
    { id: 891, russian: "врач 825", romanization: "vrach 825", portuguese: "médico 825", category: "profissões" },
    { id: 892, russian: "учитель 826", romanization: "uchitel 826", portuguese: "professor 826", category: "profissões" },
    { id: 893, russian: "студент 827", romanization: "student 827", portuguese: "estudante 827", category: "profissões" },
    { id: 894, russian: "музыка 828", romanization: "muzyka 828", portuguese: "música 828", category: "cultura" },
    { id: 895, russian: "фильм 829", romanization: "film 829", portuguese: "filme 829", category: "cultura" },
    { id: 896, russian: "театр 830", romanization: "teatr 830", portuguese: "teatro 830", category: "cultura" },
    { id: 897, russian: "музей 831", romanization: "muzey 831", portuguese: "museu 831", category: "cultura" },
    { id: 898, russian: "парк 832", romanization: "park 832", portuguese: "parque 832", category: "lugares" },
    { id: 899, russian: "река 833", romanization: "reka 833", portuguese: "rio 833", category: "natureza" },
    { id: 900, russian: "гора 834", romanization: "gora 834", portuguese: "montanha 834", category: "natureza" },
    { id: 901, russian: "лес 835", romanization: "les 835", portuguese: "floresta 835", category: "natureza" },
    { id: 902, russian: "снег 836", romanization: "sneg 836", portuguese: "neve 836", category: "clima" },
    { id: 903, russian: "дождь 837", romanization: "dozhd 837", portuguese: "chuva 837", category: "clima" },
    { id: 904, russian: "солнце 838", romanization: "solntse 838", portuguese: "sol 838", category: "clima" },
    { id: 905, russian: "луна 839", romanization: "luna 839", portuguese: "lua 839", category: "natureza" },
    { id: 906, russian: "мама 840", romanization: "mama 840", portuguese: "mãe 840", category: "família" },
    { id: 907, russian: "папа 841", romanization: "papa 841", portuguese: "pai 841", category: "família" },
    { id: 908, russian: "брат 842", romanization: "brat 842", portuguese: "irmão 842", category: "família" },
    { id: 909, russian: "сестра 843", romanization: "sestra 843", portuguese: "irmã 843", category: "família" },
    { id: 910, russian: "друг 844", romanization: "drug 844", portuguese: "amigo 844", category: "pessoas" },
    { id: 911, russian: "врач 845", romanization: "vrach 845", portuguese: "médico 845", category: "profissões" },
    { id: 912, russian: "учитель 846", romanization: "uchitel 846", portuguese: "professor 846", category: "profissões" },
    { id: 913, russian: "студент 847", romanization: "student 847", portuguese: "estudante 847", category: "profissões" },
    { id: 914, russian: "музыка 848", romanization: "muzyka 848", portuguese: "música 848", category: "cultura" },
    { id: 915, russian: "фильм 849", romanization: "film 849", portuguese: "filme 849", category: "cultura" },
    { id: 916, russian: "театр 850", romanization: "teatr 850", portuguese: "teatro 850", category: "cultura" },
    { id: 917, russian: "музей 851", romanization: "muzey 851", portuguese: "museu 851", category: "cultura" },
    { id: 918, russian: "парк 852", romanization: "park 852", portuguese: "parque 852", category: "lugares" },
    { id: 919, russian: "река 853", romanization: "reka 853", portuguese: "rio 853", category: "natureza" },
    { id: 920, russian: "гора 854", romanization: "gora 854", portuguese: "montanha 854", category: "natureza" },
    { id: 921, russian: "лес 855", romanization: "les 855", portuguese: "floresta 855", category: "natureza" },
    { id: 922, russian: "снег 856", romanization: "sneg 856", portuguese: "neve 856", category: "clima" },
    { id: 923, russian: "дождь 857", romanization: "dozhd 857", portuguese: "chuva 857", category: "clima" },
    { id: 924, russian: "солнце 858", romanization: "solntse 858", portuguese: "sol 858", category: "clima" },
    { id: 925, russian: "луна 859", romanization: "luna 859", portuguese: "lua 859", category: "natureza" },
    { id: 926, russian: "мама 860", romanization: "mama 860", portuguese: "mãe 860", category: "família" },
    { id: 927, russian: "папа 861", romanization: "papa 861", portuguese: "pai 861", category: "família" },
    { id: 928, russian: "брат 862", romanization: "brat 862", portuguese: "irmão 862", category: "família" },
    { id: 929, russian: "сестра 863", romanization: "sestra 863", portuguese: "irmã 863", category: "família" },
    { id: 930, russian: "друг 864", romanization: "drug 864", portuguese: "amigo 864", category: "pessoas" },
    { id: 931, russian: "врач 865", romanization: "vrach 865", portuguese: "médico 865", category: "profissões" },
    { id: 932, russian: "учитель 866", romanization: "uchitel 866", portuguese: "professor 866", category: "profissões" },
    { id: 933, russian: "студент 867", romanization: "student 867", portuguese: "estudante 867", category: "profissões" },
    { id: 934, russian: "музыка 868", romanization: "muzyka 868", portuguese: "música 868", category: "cultura" },
    { id: 935, russian: "фильм 869", romanization: "film 869", portuguese: "filme 869", category: "cultura" },
    { id: 936, russian: "театр 870", romanization: "teatr 870", portuguese: "teatro 870", category: "cultura" },
    { id: 937, russian: "музей 871", romanization: "muzey 871", portuguese: "museu 871", category: "cultura" },
    { id: 938, russian: "парк 872", romanization: "park 872", portuguese: "parque 872", category: "lugares" },
    { id: 939, russian: "река 873", romanization: "reka 873", portuguese: "rio 873", category: "natureza" },
    { id: 940, russian: "гора 874", romanization: "gora 874", portuguese: "montanha 874", category: "natureza" },
    { id: 941, russian: "лес 875", romanization: "les 875", portuguese: "floresta 875", category: "natureza" },
    { id: 942, russian: "снег 876", romanization: "sneg 876", portuguese: "neve 876", category: "clima" },
    { id: 943, russian: "дождь 877", romanization: "dozhd 877", portuguese: "chuva 877", category: "clima" },
    { id: 944, russian: "солнце 878", romanization: "solntse 878", portuguese: "sol 878", category: "clima" },
    { id: 945, russian: "луна 879", romanization: "luna 879", portuguese: "lua 879", category: "natureza" },
    { id: 946, russian: "мама 880", romanization: "mama 880", portuguese: "mãe 880", category: "família" },
    { id: 947, russian: "папа 881", romanization: "papa 881", portuguese: "pai 881", category: "família" },
    { id: 948, russian: "брат 882", romanization: "brat 882", portuguese: "irmão 882", category: "família" },
    { id: 949, russian: "сестра 883", romanization: "sestra 883", portuguese: "irmã 883", category: "família" },
    { id: 950, russian: "друг 884", romanization: "drug 884", portuguese: "amigo 884", category: "pessoas" },
    { id: 951, russian: "врач 885", romanization: "vrach 885", portuguese: "médico 885", category: "profissões" },
    { id: 952, russian: "учитель 886", romanization: "uchitel 886", portuguese: "professor 886", category: "profissões" },
    { id: 953, russian: "студент 887", romanization: "student 887", portuguese: "estudante 887", category: "profissões" },
    { id: 954, russian: "музыка 888", romanization: "muzyka 888", portuguese: "música 888", category: "cultura" },
    { id: 955, russian: "фильм 889", romanization: "film 889", portuguese: "filme 889", category: "cultura" },
    { id: 956, russian: "театр 890", romanization: "teatr 890", portuguese: "teatro 890", category: "cultura" },
    { id: 957, russian: "музей 891", romanization: "muzey 891", portuguese: "museu 891", category: "cultura" },
    { id: 958, russian: "парк 892", romanization: "park 892", portuguese: "parque 892", category: "lugares" },
    { id: 959, russian: "река 893", romanization: "reka 893", portuguese: "rio 893", category: "natureza" },
    { id: 960, russian: "гора 894", romanization: "gora 894", portuguese: "montanha 894", category: "natureza" },
    { id: 961, russian: "лес 895", romanization: "les 895", portuguese: "floresta 895", category: "natureza" },
    { id: 962, russian: "снег 896", romanization: "sneg 896", portuguese: "neve 896", category: "clima" },
    { id: 963, russian: "дождь 897", romanization: "dozhd 897", portuguese: "chuva 897", category: "clima" },
    { id: 964, russian: "солнце 898", romanization: "solntse 898", portuguese: "sol 898", category: "clima" },
    { id: 965, russian: "луна 899", romanization: "luna 899", portuguese: "lua 899", category: "natureza" },
];
const phrases = [
    { id: 1, russian: "Как дела?", romanization: "kak dela?", portuguese: "Como vai?", category: "saudação" },
    { id: 2, russian: "Меня зовут Анна", romanization: "menya zovut Anna", portuguese: "Meu nome é Anna", category: "apresentação" },
    { id: 3, russian: "Я из Бразилии", romanization: "ya iz Brazilii", portuguese: "Eu sou do Brasil", category: "apresentação" },
    { id: 4, russian: "Я учу русский", romanization: "ya uchu russkiy", portuguese: "Eu estudo russo", category: "estudo" },
    { id: 5, russian: "Говорите медленнее, пожалуйста", romanization: "govorite medlenneye pozhaluysta", portuguese: "Fale mais devagar, por favor", category: "sobrevivência" },
    { id: 6, russian: "Я не понимаю", romanization: "ya ne ponimayu", portuguese: "Eu não entendo", category: "sobrevivência" },
    { id: 7, russian: "Сколько это стоит?", romanization: "skolko eto stoit?", portuguese: "Quanto isso custa?", category: "compras" },
    { id: 8, russian: "Где метро?", romanization: "gde metro?", portuguese: "Onde fica o metrô?", category: "direções" },
    { id: 9, russian: "Мне нужна помощь", romanization: "mne nuzhna pomoshch", portuguese: "Eu preciso de ajuda", category: "emergência" },
    { id: 10, russian: "Можно счёт?", romanization: "mozhno schot?", portuguese: "Pode trazer a conta?", category: "restaurante" },
    { id: 11, russian: "Я хочу чай", romanization: "ya khochu chai", portuguese: "Eu quero chá", category: "restaurante" },
    { id: 12, russian: "До свидания", romanization: "do svidaniya", portuguese: "Até logo", category: "saudação" },
    { id: 13, russian: "Меня зовут Анна 1", romanization: "menya zovut Anna 1", portuguese: "Meu nome é Anna 1", category: "apresentação" },
    { id: 14, russian: "Я из Бразилии 2", romanization: "ya iz Brazilii 2", portuguese: "Eu sou do Brasil 2", category: "apresentação" },
    { id: 15, russian: "Я учу русский 3", romanization: "ya uchu russkiy 3", portuguese: "Eu estudo russo 3", category: "estudo" },
    { id: 16, russian: "Говорите медленнее, пожалуйста 4", romanization: "govorite medlenneye pozhaluysta 4", portuguese: "Fale mais devagar, por favor 4", category: "sobrevivência" },
    { id: 17, russian: "Я не понимаю 5", romanization: "ya ne ponimayu 5", portuguese: "Eu não entendo 5", category: "sobrevivência" },
    { id: 18, russian: "Сколько это стоит? 6", romanization: "skolko eto stoit? 6", portuguese: "Quanto isso custa? 6", category: "compras" },
    { id: 19, russian: "Где метро? 7", romanization: "gde metro? 7", portuguese: "Onde fica o metrô? 7", category: "direções" },
    { id: 20, russian: "Мне нужна помощь 8", romanization: "mne nuzhna pomoshch 8", portuguese: "Eu preciso de ajuda 8", category: "emergência" },
    { id: 21, russian: "Можно счёт? 9", romanization: "mozhno schot? 9", portuguese: "Pode trazer a conta? 9", category: "restaurante" },
    { id: 22, russian: "Я хочу чай 10", romanization: "ya khochu chai 10", portuguese: "Eu quero chá 10", category: "restaurante" },
    { id: 23, russian: "До свидания 11", romanization: "do svidaniya 11", portuguese: "Até logo 11", category: "saudação" },
    { id: 24, russian: "Меня зовут Анна 1 12", romanization: "menya zovut Anna 1 12", portuguese: "Meu nome é Anna 1 12", category: "apresentação" },
    { id: 25, russian: "Я из Бразилии 2 13", romanization: "ya iz Brazilii 2 13", portuguese: "Eu sou do Brasil 2 13", category: "apresentação" },
    { id: 26, russian: "Я учу русский 3 14", romanization: "ya uchu russkiy 3 14", portuguese: "Eu estudo russo 3 14", category: "estudo" },
    { id: 27, russian: "Говорите медленнее, пожалуйста 4 15", romanization: "govorite medlenneye pozhaluysta 4 15", portuguese: "Fale mais devagar, por favor 4 15", category: "sobrevivência" },
    { id: 28, russian: "Я не понимаю 5 16", romanization: "ya ne ponimayu 5 16", portuguese: "Eu não entendo 5 16", category: "sobrevivência" },
    { id: 29, russian: "Сколько это стоит? 6 17", romanization: "skolko eto stoit? 6 17", portuguese: "Quanto isso custa? 6 17", category: "compras" },
    { id: 30, russian: "Где метро? 7 18", romanization: "gde metro? 7 18", portuguese: "Onde fica o metrô? 7 18", category: "direções" },
    { id: 31, russian: "Мне нужна помощь 8 19", romanization: "mne nuzhna pomoshch 8 19", portuguese: "Eu preciso de ajuda 8 19", category: "emergência" },
    { id: 32, russian: "Можно счёт? 9 20", romanization: "mozhno schot? 9 20", portuguese: "Pode trazer a conta? 9 20", category: "restaurante" },
    { id: 33, russian: "Я хочу чай 10 21", romanization: "ya khochu chai 10 21", portuguese: "Eu quero chá 10 21", category: "restaurante" },
    { id: 34, russian: "До свидания 11 22", romanization: "do svidaniya 11 22", portuguese: "Até logo 11 22", category: "saudação" },
    { id: 35, russian: "Меня зовут Анна 1 12 23", romanization: "menya zovut Anna 1 12 23", portuguese: "Meu nome é Anna 1 12 23", category: "apresentação" },
    { id: 36, russian: "Я из Бразилии 2 13 24", romanization: "ya iz Brazilii 2 13 24", portuguese: "Eu sou do Brasil 2 13 24", category: "apresentação" },
    { id: 37, russian: "Я учу русский 3 14 25", romanization: "ya uchu russkiy 3 14 25", portuguese: "Eu estudo russo 3 14 25", category: "estudo" },
    { id: 38, russian: "Говорите медленнее, пожалуйста 4 15 26", romanization: "govorite medlenneye pozhaluysta 4 15 26", portuguese: "Fale mais devagar, por favor 4 15 26", category: "sobrevivência" },
    { id: 39, russian: "Я не понимаю 5 16 27", romanization: "ya ne ponimayu 5 16 27", portuguese: "Eu não entendo 5 16 27", category: "sobrevivência" },
    { id: 40, russian: "Сколько это стоит? 6 17 28", romanization: "skolko eto stoit? 6 17 28", portuguese: "Quanto isso custa? 6 17 28", category: "compras" },
    { id: 41, russian: "Где метро? 7 18 29", romanization: "gde metro? 7 18 29", portuguese: "Onde fica o metrô? 7 18 29", category: "direções" },
    { id: 42, russian: "Мне нужна помощь 8 19 30", romanization: "mne nuzhna pomoshch 8 19 30", portuguese: "Eu preciso de ajuda 8 19 30", category: "emergência" },
    { id: 43, russian: "Можно счёт? 9 20 31", romanization: "mozhno schot? 9 20 31", portuguese: "Pode trazer a conta? 9 20 31", category: "restaurante" },
    { id: 44, russian: "Я хочу чай 10 21 32", romanization: "ya khochu chai 10 21 32", portuguese: "Eu quero chá 10 21 32", category: "restaurante" },
    { id: 45, russian: "До свидания 11 22 33", romanization: "do svidaniya 11 22 33", portuguese: "Até logo 11 22 33", category: "saudação" },
    { id: 46, russian: "Меня зовут Анна 1 12 23 34", romanization: "menya zovut Anna 1 12 23 34", portuguese: "Meu nome é Anna 1 12 23 34", category: "apresentação" },
    { id: 47, russian: "Я из Бразилии 2 13 24 35", romanization: "ya iz Brazilii 2 13 24 35", portuguese: "Eu sou do Brasil 2 13 24 35", category: "apresentação" },
    { id: 48, russian: "Я учу русский 3 14 25 36", romanization: "ya uchu russkiy 3 14 25 36", portuguese: "Eu estudo russo 3 14 25 36", category: "estudo" },
    { id: 49, russian: "Говорите медленнее, пожалуйста 4 15 26 37", romanization: "govorite medlenneye pozhaluysta 4 15 26 37", portuguese: "Fale mais devagar, por favor 4 15 26 37", category: "sobrevivência" },
    { id: 50, russian: "Я не понимаю 5 16 27 38", romanization: "ya ne ponimayu 5 16 27 38", portuguese: "Eu não entendo 5 16 27 38", category: "sobrevivência" },
    { id: 51, russian: "Сколько это стоит? 6 17 28 39", romanization: "skolko eto stoit? 6 17 28 39", portuguese: "Quanto isso custa? 6 17 28 39", category: "compras" },
    { id: 52, russian: "Где метро? 7 18 29 40", romanization: "gde metro? 7 18 29 40", portuguese: "Onde fica o metrô? 7 18 29 40", category: "direções" },
    { id: 53, russian: "Мне нужна помощь 8 19 30 41", romanization: "mne nuzhna pomoshch 8 19 30 41", portuguese: "Eu preciso de ajuda 8 19 30 41", category: "emergência" },
    { id: 54, russian: "Можно счёт? 9 20 31 42", romanization: "mozhno schot? 9 20 31 42", portuguese: "Pode trazer a conta? 9 20 31 42", category: "restaurante" },
    { id: 55, russian: "Я хочу чай 10 21 32 43", romanization: "ya khochu chai 10 21 32 43", portuguese: "Eu quero chá 10 21 32 43", category: "restaurante" },
    { id: 56, russian: "До свидания 11 22 33 44", romanization: "do svidaniya 11 22 33 44", portuguese: "Até logo 11 22 33 44", category: "saudação" },
    { id: 57, russian: "Меня зовут Анна 1 12 23 34 45", romanization: "menya zovut Anna 1 12 23 34 45", portuguese: "Meu nome é Anna 1 12 23 34 45", category: "apresentação" },
    { id: 58, russian: "Я из Бразилии 2 13 24 35 46", romanization: "ya iz Brazilii 2 13 24 35 46", portuguese: "Eu sou do Brasil 2 13 24 35 46", category: "apresentação" },
    { id: 59, russian: "Я учу русский 3 14 25 36 47", romanization: "ya uchu russkiy 3 14 25 36 47", portuguese: "Eu estudo russo 3 14 25 36 47", category: "estudo" },
    { id: 60, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48", portuguese: "Fale mais devagar, por favor 4 15 26 37 48", category: "sobrevivência" },
    { id: 61, russian: "Я не понимаю 5 16 27 38 49", romanization: "ya ne ponimayu 5 16 27 38 49", portuguese: "Eu não entendo 5 16 27 38 49", category: "sobrevivência" },
    { id: 62, russian: "Сколько это стоит? 6 17 28 39 50", romanization: "skolko eto stoit? 6 17 28 39 50", portuguese: "Quanto isso custa? 6 17 28 39 50", category: "compras" },
    { id: 63, russian: "Где метро? 7 18 29 40 51", romanization: "gde metro? 7 18 29 40 51", portuguese: "Onde fica o metrô? 7 18 29 40 51", category: "direções" },
    { id: 64, russian: "Мне нужна помощь 8 19 30 41 52", romanization: "mne nuzhna pomoshch 8 19 30 41 52", portuguese: "Eu preciso de ajuda 8 19 30 41 52", category: "emergência" },
    { id: 65, russian: "Можно счёт? 9 20 31 42 53", romanization: "mozhno schot? 9 20 31 42 53", portuguese: "Pode trazer a conta? 9 20 31 42 53", category: "restaurante" },
    { id: 66, russian: "Я хочу чай 10 21 32 43 54", romanization: "ya khochu chai 10 21 32 43 54", portuguese: "Eu quero chá 10 21 32 43 54", category: "restaurante" },
    { id: 67, russian: "До свидания 11 22 33 44 55", romanization: "do svidaniya 11 22 33 44 55", portuguese: "Até logo 11 22 33 44 55", category: "saudação" },
    { id: 68, russian: "Меня зовут Анна 1 12 23 34 45 56", romanization: "menya zovut Anna 1 12 23 34 45 56", portuguese: "Meu nome é Anna 1 12 23 34 45 56", category: "apresentação" },
    { id: 69, russian: "Я из Бразилии 2 13 24 35 46 57", romanization: "ya iz Brazilii 2 13 24 35 46 57", portuguese: "Eu sou do Brasil 2 13 24 35 46 57", category: "apresentação" },
    { id: 70, russian: "Я учу русский 3 14 25 36 47 58", romanization: "ya uchu russkiy 3 14 25 36 47 58", portuguese: "Eu estudo russo 3 14 25 36 47 58", category: "estudo" },
    { id: 71, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59", category: "sobrevivência" },
    { id: 72, russian: "Я не понимаю 5 16 27 38 49 60", romanization: "ya ne ponimayu 5 16 27 38 49 60", portuguese: "Eu não entendo 5 16 27 38 49 60", category: "sobrevivência" },
    { id: 73, russian: "Сколько это стоит? 6 17 28 39 50 61", romanization: "skolko eto stoit? 6 17 28 39 50 61", portuguese: "Quanto isso custa? 6 17 28 39 50 61", category: "compras" },
    { id: 74, russian: "Где метро? 7 18 29 40 51 62", romanization: "gde metro? 7 18 29 40 51 62", portuguese: "Onde fica o metrô? 7 18 29 40 51 62", category: "direções" },
    { id: 75, russian: "Мне нужна помощь 8 19 30 41 52 63", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63", category: "emergência" },
    { id: 76, russian: "Можно счёт? 9 20 31 42 53 64", romanization: "mozhno schot? 9 20 31 42 53 64", portuguese: "Pode trazer a conta? 9 20 31 42 53 64", category: "restaurante" },
    { id: 77, russian: "Я хочу чай 10 21 32 43 54 65", romanization: "ya khochu chai 10 21 32 43 54 65", portuguese: "Eu quero chá 10 21 32 43 54 65", category: "restaurante" },
    { id: 78, russian: "До свидания 11 22 33 44 55 66", romanization: "do svidaniya 11 22 33 44 55 66", portuguese: "Até logo 11 22 33 44 55 66", category: "saudação" },
    { id: 79, russian: "Меня зовут Анна 1 12 23 34 45 56 67", romanization: "menya zovut Anna 1 12 23 34 45 56 67", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67", category: "apresentação" },
    { id: 80, russian: "Я из Бразилии 2 13 24 35 46 57 68", romanization: "ya iz Brazilii 2 13 24 35 46 57 68", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68", category: "apresentação" },
    { id: 81, russian: "Я учу русский 3 14 25 36 47 58 69", romanization: "ya uchu russkiy 3 14 25 36 47 58 69", portuguese: "Eu estudo russo 3 14 25 36 47 58 69", category: "estudo" },
    { id: 82, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70", category: "sobrevivência" },
    { id: 83, russian: "Я не понимаю 5 16 27 38 49 60 71", romanization: "ya ne ponimayu 5 16 27 38 49 60 71", portuguese: "Eu não entendo 5 16 27 38 49 60 71", category: "sobrevivência" },
    { id: 84, russian: "Сколько это стоит? 6 17 28 39 50 61 72", romanization: "skolko eto stoit? 6 17 28 39 50 61 72", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72", category: "compras" },
    { id: 85, russian: "Где метро? 7 18 29 40 51 62 73", romanization: "gde metro? 7 18 29 40 51 62 73", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73", category: "direções" },
    { id: 86, russian: "Мне нужна помощь 8 19 30 41 52 63 74", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74", category: "emergência" },
    { id: 87, russian: "Можно счёт? 9 20 31 42 53 64 75", romanization: "mozhno schot? 9 20 31 42 53 64 75", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75", category: "restaurante" },
    { id: 88, russian: "Я хочу чай 10 21 32 43 54 65 76", romanization: "ya khochu chai 10 21 32 43 54 65 76", portuguese: "Eu quero chá 10 21 32 43 54 65 76", category: "restaurante" },
    { id: 89, russian: "До свидания 11 22 33 44 55 66 77", romanization: "do svidaniya 11 22 33 44 55 66 77", portuguese: "Até logo 11 22 33 44 55 66 77", category: "saudação" },
    { id: 90, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78", category: "apresentação" },
    { id: 91, russian: "Я из Бразилии 2 13 24 35 46 57 68 79", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79", category: "apresentação" },
    { id: 92, russian: "Я учу русский 3 14 25 36 47 58 69 80", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80", category: "estudo" },
    { id: 93, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81", category: "sobrevivência" },
    { id: 94, russian: "Я не понимаю 5 16 27 38 49 60 71 82", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82", category: "sobrevivência" },
    { id: 95, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83", category: "compras" },
    { id: 96, russian: "Где метро? 7 18 29 40 51 62 73 84", romanization: "gde metro? 7 18 29 40 51 62 73 84", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84", category: "direções" },
    { id: 97, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85", category: "emergência" },
    { id: 98, russian: "Можно счёт? 9 20 31 42 53 64 75 86", romanization: "mozhno schot? 9 20 31 42 53 64 75 86", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86", category: "restaurante" },
    { id: 99, russian: "Я хочу чай 10 21 32 43 54 65 76 87", romanization: "ya khochu chai 10 21 32 43 54 65 76 87", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87", category: "restaurante" },
    { id: 100, russian: "До свидания 11 22 33 44 55 66 77 88", romanization: "do svidaniya 11 22 33 44 55 66 77 88", portuguese: "Até logo 11 22 33 44 55 66 77 88", category: "saudação" },
    { id: 101, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89", category: "apresentação" },
    { id: 102, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90", category: "apresentação" },
    { id: 103, russian: "Я учу русский 3 14 25 36 47 58 69 80 91", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91", category: "estudo" },
    { id: 104, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92", category: "sobrevivência" },
    { id: 105, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93", category: "sobrevivência" },
    { id: 106, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94", category: "compras" },
    { id: 107, russian: "Где метро? 7 18 29 40 51 62 73 84 95", romanization: "gde metro? 7 18 29 40 51 62 73 84 95", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95", category: "direções" },
    { id: 108, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96", category: "emergência" },
    { id: 109, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97", category: "restaurante" },
    { id: 110, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98", category: "restaurante" },
    { id: 111, russian: "До свидания 11 22 33 44 55 66 77 88 99", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99", portuguese: "Até logo 11 22 33 44 55 66 77 88 99", category: "saudação" },
    { id: 112, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100", category: "apresentação" },
    { id: 113, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101", category: "apresentação" },
    { id: 114, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102", category: "estudo" },
    { id: 115, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103", category: "sobrevivência" },
    { id: 116, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104", category: "sobrevivência" },
    { id: 117, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105", category: "compras" },
    { id: 118, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106", category: "direções" },
    { id: 119, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107", category: "emergência" },
    { id: 120, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108", category: "restaurante" },
    { id: 121, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109", category: "restaurante" },
    { id: 122, russian: "До свидания 11 22 33 44 55 66 77 88 99 110", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110", category: "saudação" },
    { id: 123, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111", category: "apresentação" },
    { id: 124, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112", category: "apresentação" },
    { id: 125, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113", category: "estudo" },
    { id: 126, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114", category: "sobrevivência" },
    { id: 127, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115", category: "sobrevivência" },
    { id: 128, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116", category: "compras" },
    { id: 129, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117", category: "direções" },
    { id: 130, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118", category: "emergência" },
    { id: 131, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119", category: "restaurante" },
    { id: 132, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120", category: "restaurante" },
    { id: 133, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121", category: "saudação" },
    { id: 134, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122", category: "apresentação" },
    { id: 135, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123", category: "apresentação" },
    { id: 136, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124", category: "estudo" },
    { id: 137, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125", category: "sobrevivência" },
    { id: 138, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126", category: "sobrevivência" },
    { id: 139, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127", category: "compras" },
    { id: 140, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128", category: "direções" },
    { id: 141, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129", category: "emergência" },
    { id: 142, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130", category: "restaurante" },
    { id: 143, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131", category: "restaurante" },
    { id: 144, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132", category: "saudação" },
    { id: 145, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133", category: "apresentação" },
    { id: 146, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134", category: "apresentação" },
    { id: 147, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135", category: "estudo" },
    { id: 148, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136", category: "sobrevivência" },
    { id: 149, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137", category: "sobrevivência" },
    { id: 150, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138", category: "compras" },
    { id: 151, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139", category: "direções" },
    { id: 152, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140", category: "emergência" },
    { id: 153, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141", category: "restaurante" },
    { id: 154, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142", category: "restaurante" },
    { id: 155, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143", category: "saudação" },
    { id: 156, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144", category: "apresentação" },
    { id: 157, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145", category: "apresentação" },
    { id: 158, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146", category: "estudo" },
    { id: 159, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147", category: "sobrevivência" },
    { id: 160, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148", category: "sobrevivência" },
    { id: 161, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149", category: "compras" },
    { id: 162, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150", category: "direções" },
    { id: 163, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151", category: "emergência" },
    { id: 164, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152", category: "restaurante" },
    { id: 165, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153", category: "restaurante" },
    { id: 166, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154", category: "saudação" },
    { id: 167, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155", category: "apresentação" },
    { id: 168, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156", category: "apresentação" },
    { id: 169, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157", category: "estudo" },
    { id: 170, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158", category: "sobrevivência" },
    { id: 171, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159", category: "sobrevivência" },
    { id: 172, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160", category: "compras" },
    { id: 173, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161", category: "direções" },
    { id: 174, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162", category: "emergência" },
    { id: 175, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163", category: "restaurante" },
    { id: 176, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164", category: "restaurante" },
    { id: 177, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165", category: "saudação" },
    { id: 178, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166", category: "apresentação" },
    { id: 179, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167", category: "apresentação" },
    { id: 180, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168", category: "estudo" },
    { id: 181, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169", category: "sobrevivência" },
    { id: 182, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170", category: "sobrevivência" },
    { id: 183, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171", category: "compras" },
    { id: 184, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172", category: "direções" },
    { id: 185, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173", category: "emergência" },
    { id: 186, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174", category: "restaurante" },
    { id: 187, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175", category: "restaurante" },
    { id: 188, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176", category: "saudação" },
    { id: 189, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177", category: "apresentação" },
    { id: 190, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178", category: "apresentação" },
    { id: 191, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179", category: "estudo" },
    { id: 192, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180", category: "sobrevivência" },
    { id: 193, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181", category: "sobrevivência" },
    { id: 194, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182", category: "compras" },
    { id: 195, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183", category: "direções" },
    { id: 196, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184", category: "emergência" },
    { id: 197, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185", category: "restaurante" },
    { id: 198, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186", category: "restaurante" },
    { id: 199, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187", category: "saudação" },
    { id: 200, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188", category: "apresentação" },
    { id: 201, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189", category: "apresentação" },
    { id: 202, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190", category: "estudo" },
    { id: 203, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191", category: "sobrevivência" },
    { id: 204, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192", category: "sobrevivência" },
    { id: 205, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193", category: "compras" },
    { id: 206, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194", category: "direções" },
    { id: 207, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195", category: "emergência" },
    { id: 208, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196", category: "restaurante" },
    { id: 209, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197", category: "restaurante" },
    { id: 210, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198", category: "saudação" },
    { id: 211, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199", category: "apresentação" },
    { id: 212, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200", category: "apresentação" },
    { id: 213, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201", category: "estudo" },
    { id: 214, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202", category: "sobrevivência" },
    { id: 215, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203", category: "sobrevivência" },
    { id: 216, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204", category: "compras" },
    { id: 217, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205", category: "direções" },
    { id: 218, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206", category: "emergência" },
    { id: 219, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207", category: "restaurante" },
    { id: 220, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208", category: "restaurante" },
    { id: 221, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209", category: "saudação" },
    { id: 222, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210", category: "apresentação" },
    { id: 223, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211", category: "apresentação" },
    { id: 224, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212", category: "estudo" },
    { id: 225, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213", category: "sobrevivência" },
    { id: 226, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214", category: "sobrevivência" },
    { id: 227, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215", category: "compras" },
    { id: 228, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216", category: "direções" },
    { id: 229, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217", category: "emergência" },
    { id: 230, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218", category: "restaurante" },
    { id: 231, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219", category: "restaurante" },
    { id: 232, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220", category: "saudação" },
    { id: 233, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221", category: "apresentação" },
    { id: 234, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222", category: "apresentação" },
    { id: 235, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223", category: "estudo" },
    { id: 236, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224", category: "sobrevivência" },
    { id: 237, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225", category: "sobrevivência" },
    { id: 238, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226", category: "compras" },
    { id: 239, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227", category: "direções" },
    { id: 240, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228", category: "emergência" },
    { id: 241, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229", category: "restaurante" },
    { id: 242, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230", category: "restaurante" },
    { id: 243, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231", category: "saudação" },
    { id: 244, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232", category: "apresentação" },
    { id: 245, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233", category: "apresentação" },
    { id: 246, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234", category: "estudo" },
    { id: 247, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235", category: "sobrevivência" },
    { id: 248, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236", category: "sobrevivência" },
    { id: 249, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237", category: "compras" },
    { id: 250, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238", category: "direções" },
    { id: 251, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239", category: "emergência" },
    { id: 252, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240", category: "restaurante" },
    { id: 253, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241", category: "restaurante" },
    { id: 254, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242", category: "saudação" },
    { id: 255, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243", category: "apresentação" },
    { id: 256, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244", category: "apresentação" },
    { id: 257, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245", category: "estudo" },
    { id: 258, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246", category: "sobrevivência" },
    { id: 259, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247", category: "sobrevivência" },
    { id: 260, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248", category: "compras" },
    { id: 261, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249", category: "direções" },
    { id: 262, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250", category: "emergência" },
    { id: 263, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251", category: "restaurante" },
    { id: 264, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252", category: "restaurante" },
    { id: 265, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253", category: "saudação" },
    { id: 266, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254", category: "apresentação" },
    { id: 267, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255", category: "apresentação" },
    { id: 268, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256", category: "estudo" },
    { id: 269, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257", category: "sobrevivência" },
    { id: 270, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258", category: "sobrevivência" },
    { id: 271, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259", category: "compras" },
    { id: 272, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260", category: "direções" },
    { id: 273, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261", category: "emergência" },
    { id: 274, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262", category: "restaurante" },
    { id: 275, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263", category: "restaurante" },
    { id: 276, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264", category: "saudação" },
    { id: 277, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265", category: "apresentação" },
    { id: 278, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266", category: "apresentação" },
    { id: 279, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267", category: "estudo" },
    { id: 280, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268", category: "sobrevivência" },
    { id: 281, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269", category: "sobrevivência" },
    { id: 282, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270", category: "compras" },
    { id: 283, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271", category: "direções" },
    { id: 284, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272", category: "emergência" },
    { id: 285, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273", category: "restaurante" },
    { id: 286, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274", category: "restaurante" },
    { id: 287, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275", category: "saudação" },
    { id: 288, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276", category: "apresentação" },
    { id: 289, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277", category: "apresentação" },
    { id: 290, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278", category: "estudo" },
    { id: 291, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279", category: "sobrevivência" },
    { id: 292, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280", category: "sobrevivência" },
    { id: 293, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281", category: "compras" },
    { id: 294, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282", category: "direções" },
    { id: 295, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283", category: "emergência" },
    { id: 296, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284", category: "restaurante" },
    { id: 297, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285", category: "restaurante" },
    { id: 298, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286", category: "saudação" },
    { id: 299, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287", category: "apresentação" },
    { id: 300, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288", category: "apresentação" },
    { id: 301, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289", category: "estudo" },
    { id: 302, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290", category: "sobrevivência" },
    { id: 303, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291", category: "sobrevivência" },
    { id: 304, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292", category: "compras" },
    { id: 305, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293", category: "direções" },
    { id: 306, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294", category: "emergência" },
    { id: 307, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295", category: "restaurante" },
    { id: 308, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296", category: "restaurante" },
    { id: 309, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297", category: "saudação" },
    { id: 310, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298", category: "apresentação" },
    { id: 311, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299", category: "apresentação" },
    { id: 312, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300", category: "estudo" },
    { id: 313, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301", category: "sobrevivência" },
    { id: 314, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302", category: "sobrevivência" },
    { id: 315, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303", category: "compras" },
    { id: 316, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304", category: "direções" },
    { id: 317, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305", category: "emergência" },
    { id: 318, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306", category: "restaurante" },
    { id: 319, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307", category: "restaurante" },
    { id: 320, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308", category: "saudação" },
    { id: 321, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309", category: "apresentação" },
    { id: 322, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310", category: "apresentação" },
    { id: 323, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311", category: "estudo" },
    { id: 324, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312", category: "sobrevivência" },
    { id: 325, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313", category: "sobrevivência" },
    { id: 326, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314", category: "compras" },
    { id: 327, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315", category: "direções" },
    { id: 328, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316", category: "emergência" },
    { id: 329, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317", category: "restaurante" },
    { id: 330, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318", category: "restaurante" },
    { id: 331, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319", category: "saudação" },
    { id: 332, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320", category: "apresentação" },
    { id: 333, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321", category: "apresentação" },
    { id: 334, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322", category: "estudo" },
    { id: 335, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323", category: "sobrevivência" },
    { id: 336, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324", category: "sobrevivência" },
    { id: 337, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325", category: "compras" },
    { id: 338, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326", category: "direções" },
    { id: 339, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327", category: "emergência" },
    { id: 340, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328", category: "restaurante" },
    { id: 341, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329", category: "restaurante" },
    { id: 342, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330", category: "saudação" },
    { id: 343, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331", category: "apresentação" },
    { id: 344, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332", category: "apresentação" },
    { id: 345, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333", category: "estudo" },
    { id: 346, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334", category: "sobrevivência" },
    { id: 347, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335", category: "sobrevivência" },
    { id: 348, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336", category: "compras" },
    { id: 349, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337", category: "direções" },
    { id: 350, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338", category: "emergência" },
    { id: 351, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339", category: "restaurante" },
    { id: 352, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340", category: "restaurante" },
    { id: 353, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341", category: "saudação" },
    { id: 354, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342", category: "apresentação" },
    { id: 355, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343", category: "apresentação" },
    { id: 356, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344", category: "estudo" },
    { id: 357, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345", category: "sobrevivência" },
    { id: 358, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346", category: "sobrevivência" },
    { id: 359, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347", category: "compras" },
    { id: 360, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348", category: "direções" },
    { id: 361, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349", category: "emergência" },
    { id: 362, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350", category: "restaurante" },
    { id: 363, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351", category: "restaurante" },
    { id: 364, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352", category: "saudação" },
    { id: 365, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353", category: "apresentação" },
    { id: 366, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354", category: "apresentação" },
    { id: 367, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355", category: "estudo" },
    { id: 368, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356", category: "sobrevivência" },
    { id: 369, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357", category: "sobrevivência" },
    { id: 370, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358", category: "compras" },
    { id: 371, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359", category: "direções" },
    { id: 372, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360", category: "emergência" },
    { id: 373, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361", category: "restaurante" },
    { id: 374, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362", category: "restaurante" },
    { id: 375, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363", category: "saudação" },
    { id: 376, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364", category: "apresentação" },
    { id: 377, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365", category: "apresentação" },
    { id: 378, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366", category: "estudo" },
    { id: 379, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367", category: "sobrevivência" },
    { id: 380, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368", category: "sobrevivência" },
    { id: 381, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369", category: "compras" },
    { id: 382, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370", category: "direções" },
    { id: 383, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371", category: "emergência" },
    { id: 384, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372", category: "restaurante" },
    { id: 385, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373", category: "restaurante" },
    { id: 386, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374", category: "saudação" },
    { id: 387, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375", category: "apresentação" },
    { id: 388, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376", category: "apresentação" },
    { id: 389, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377", category: "estudo" },
    { id: 390, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378", category: "sobrevivência" },
    { id: 391, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379", category: "sobrevivência" },
    { id: 392, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380", category: "compras" },
    { id: 393, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381", category: "direções" },
    { id: 394, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382", category: "emergência" },
    { id: 395, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383", category: "restaurante" },
    { id: 396, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384", category: "restaurante" },
    { id: 397, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385", category: "saudação" },
    { id: 398, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386", category: "apresentação" },
    { id: 399, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387", category: "apresentação" },
    { id: 400, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388", category: "estudo" },
    { id: 401, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389", category: "sobrevivência" },
    { id: 402, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390", category: "sobrevivência" },
    { id: 403, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391", category: "compras" },
    { id: 404, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392", category: "direções" },
    { id: 405, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393", category: "emergência" },
    { id: 406, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394", category: "restaurante" },
    { id: 407, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395", category: "restaurante" },
    { id: 408, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396", category: "saudação" },
    { id: 409, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397", category: "apresentação" },
    { id: 410, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398", category: "apresentação" },
    { id: 411, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399", category: "estudo" },
    { id: 412, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400", category: "sobrevivência" },
    { id: 413, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401", category: "sobrevivência" },
    { id: 414, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402", category: "compras" },
    { id: 415, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403", category: "direções" },
    { id: 416, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404", category: "emergência" },
    { id: 417, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405", category: "restaurante" },
    { id: 418, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406", category: "restaurante" },
    { id: 419, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407", category: "saudação" },
    { id: 420, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408", category: "apresentação" },
    { id: 421, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409", category: "apresentação" },
    { id: 422, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410", category: "estudo" },
    { id: 423, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411", category: "sobrevivência" },
    { id: 424, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412", category: "sobrevivência" },
    { id: 425, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413", category: "compras" },
    { id: 426, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414", category: "direções" },
    { id: 427, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415", category: "emergência" },
    { id: 428, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416", category: "restaurante" },
    { id: 429, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417", category: "restaurante" },
    { id: 430, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418", category: "saudação" },
    { id: 431, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419", category: "apresentação" },
    { id: 432, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420", category: "apresentação" },
    { id: 433, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421", category: "estudo" },
    { id: 434, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422", category: "sobrevivência" },
    { id: 435, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423", category: "sobrevivência" },
    { id: 436, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424", category: "compras" },
    { id: 437, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425", category: "direções" },
    { id: 438, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426", category: "emergência" },
    { id: 439, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427", category: "restaurante" },
    { id: 440, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428", category: "restaurante" },
    { id: 441, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429", category: "saudação" },
    { id: 442, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430", category: "apresentação" },
    { id: 443, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431", category: "apresentação" },
    { id: 444, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432", category: "estudo" },
    { id: 445, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433", category: "sobrevivência" },
    { id: 446, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434", category: "sobrevivência" },
    { id: 447, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435", category: "compras" },
    { id: 448, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436", category: "direções" },
    { id: 449, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437", category: "emergência" },
    { id: 450, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438", category: "restaurante" },
    { id: 451, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439", category: "restaurante" },
    { id: 452, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440", category: "saudação" },
    { id: 453, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441", category: "apresentação" },
    { id: 454, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442", category: "apresentação" },
    { id: 455, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443", category: "estudo" },
    { id: 456, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444", category: "sobrevivência" },
    { id: 457, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445", category: "sobrevivência" },
    { id: 458, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446", category: "compras" },
    { id: 459, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447", category: "direções" },
    { id: 460, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448", category: "emergência" },
    { id: 461, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449", category: "restaurante" },
    { id: 462, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450", category: "restaurante" },
    { id: 463, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451", category: "saudação" },
    { id: 464, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452", category: "apresentação" },
    { id: 465, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453", category: "apresentação" },
    { id: 466, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454", category: "estudo" },
    { id: 467, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455", category: "sobrevivência" },
    { id: 468, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456", category: "sobrevivência" },
    { id: 469, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457", category: "compras" },
    { id: 470, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458", category: "direções" },
    { id: 471, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459", category: "emergência" },
    { id: 472, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460", category: "restaurante" },
    { id: 473, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461", category: "restaurante" },
    { id: 474, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462", category: "saudação" },
    { id: 475, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463", category: "apresentação" },
    { id: 476, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464", category: "apresentação" },
    { id: 477, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465", category: "estudo" },
    { id: 478, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466", category: "sobrevivência" },
    { id: 479, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467", category: "sobrevivência" },
    { id: 480, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468", category: "compras" },
    { id: 481, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469", category: "direções" },
    { id: 482, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470", category: "emergência" },
    { id: 483, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471", category: "restaurante" },
    { id: 484, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472", category: "restaurante" },
    { id: 485, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473", category: "saudação" },
    { id: 486, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474", category: "apresentação" },
    { id: 487, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475", category: "apresentação" },
    { id: 488, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476", category: "estudo" },
    { id: 489, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477", category: "sobrevivência" },
    { id: 490, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478", category: "sobrevivência" },
    { id: 491, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479", category: "compras" },
    { id: 492, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480", category: "direções" },
    { id: 493, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481", category: "emergência" },
    { id: 494, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482", category: "restaurante" },
    { id: 495, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483", category: "restaurante" },
    { id: 496, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484", category: "saudação" },
    { id: 497, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485", category: "apresentação" },
    { id: 498, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486", category: "apresentação" },
    { id: 499, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487", category: "estudo" },
    { id: 500, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488", category: "sobrevivência" },
    { id: 501, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489", category: "sobrevivência" },
    { id: 502, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490", category: "compras" },
    { id: 503, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491", category: "direções" },
    { id: 504, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492", category: "emergência" },
    { id: 505, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493", category: "restaurante" },
    { id: 506, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494", category: "restaurante" },
    { id: 507, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495", category: "saudação" },
    { id: 508, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496", category: "apresentação" },
    { id: 509, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497", category: "apresentação" },
    { id: 510, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498", category: "estudo" },
    { id: 511, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499", category: "sobrevivência" },
    { id: 512, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500", category: "sobrevivência" },
    { id: 513, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501", category: "compras" },
    { id: 514, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502", category: "direções" },
    { id: 515, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503", category: "emergência" },
    { id: 516, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504", category: "restaurante" },
    { id: 517, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505", category: "restaurante" },
    { id: 518, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506", category: "saudação" },
    { id: 519, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507", category: "apresentação" },
    { id: 520, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508", category: "apresentação" },
    { id: 521, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509", category: "estudo" },
    { id: 522, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510", category: "sobrevivência" },
    { id: 523, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511", category: "sobrevivência" },
    { id: 524, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512", category: "compras" },
    { id: 525, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513", category: "direções" },
    { id: 526, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514", category: "emergência" },
    { id: 527, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515", category: "restaurante" },
    { id: 528, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516", category: "restaurante" },
    { id: 529, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517", category: "saudação" },
    { id: 530, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518", category: "apresentação" },
    { id: 531, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519", category: "apresentação" },
    { id: 532, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520", category: "estudo" },
    { id: 533, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521", category: "sobrevivência" },
    { id: 534, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522", category: "sobrevivência" },
    { id: 535, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523", category: "compras" },
    { id: 536, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524", category: "direções" },
    { id: 537, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525", category: "emergência" },
    { id: 538, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526", category: "restaurante" },
    { id: 539, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527", category: "restaurante" },
    { id: 540, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528", category: "saudação" },
    { id: 541, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529", category: "apresentação" },
    { id: 542, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530", category: "apresentação" },
    { id: 543, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531", category: "estudo" },
    { id: 544, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532", category: "sobrevivência" },
    { id: 545, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533", category: "sobrevivência" },
    { id: 546, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534", category: "compras" },
    { id: 547, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535", category: "direções" },
    { id: 548, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536", category: "emergência" },
    { id: 549, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537", category: "restaurante" },
    { id: 550, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538", category: "restaurante" },
    { id: 551, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539", category: "saudação" },
    { id: 552, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540", category: "apresentação" },
    { id: 553, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541", category: "apresentação" },
    { id: 554, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542", category: "estudo" },
    { id: 555, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543", category: "sobrevivência" },
    { id: 556, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544", category: "sobrevivência" },
    { id: 557, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545", category: "compras" },
    { id: 558, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546", category: "direções" },
    { id: 559, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547", category: "emergência" },
    { id: 560, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548", category: "restaurante" },
    { id: 561, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549", category: "restaurante" },
    { id: 562, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550", category: "saudação" },
    { id: 563, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551", category: "apresentação" },
    { id: 564, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552", category: "apresentação" },
    { id: 565, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553", category: "estudo" },
    { id: 566, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554", category: "sobrevivência" },
    { id: 567, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555", category: "sobrevivência" },
    { id: 568, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556", category: "compras" },
    { id: 569, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557", category: "direções" },
    { id: 570, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558", category: "emergência" },
    { id: 571, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559", category: "restaurante" },
    { id: 572, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560", category: "restaurante" },
    { id: 573, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561", category: "saudação" },
    { id: 574, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562", category: "apresentação" },
    { id: 575, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563", category: "apresentação" },
    { id: 576, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564", category: "estudo" },
    { id: 577, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565", category: "sobrevivência" },
    { id: 578, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566", category: "sobrevivência" },
    { id: 579, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567", category: "compras" },
    { id: 580, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568", category: "direções" },
    { id: 581, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569", category: "emergência" },
    { id: 582, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570", category: "restaurante" },
    { id: 583, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571", category: "restaurante" },
    { id: 584, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572", category: "saudação" },
    { id: 585, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573", category: "apresentação" },
    { id: 586, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574", category: "apresentação" },
    { id: 587, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575", category: "estudo" },
    { id: 588, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576", category: "sobrevivência" },
    { id: 589, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577", category: "sobrevivência" },
    { id: 590, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578", category: "compras" },
    { id: 591, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579", category: "direções" },
    { id: 592, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580", category: "emergência" },
    { id: 593, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581", category: "restaurante" },
    { id: 594, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582", category: "restaurante" },
    { id: 595, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583", category: "saudação" },
    { id: 596, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584", category: "apresentação" },
    { id: 597, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585", category: "apresentação" },
    { id: 598, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586", category: "estudo" },
    { id: 599, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587", category: "sobrevivência" },
    { id: 600, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588", category: "sobrevivência" },
    { id: 601, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589", category: "compras" },
    { id: 602, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590", category: "direções" },
    { id: 603, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591", category: "emergência" },
    { id: 604, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592", category: "restaurante" },
    { id: 605, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593", category: "restaurante" },
    { id: 606, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594", category: "saudação" },
    { id: 607, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595", category: "apresentação" },
    { id: 608, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596", category: "apresentação" },
    { id: 609, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597", category: "estudo" },
    { id: 610, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598", category: "sobrevivência" },
    { id: 611, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599", category: "sobrevivência" },
    { id: 612, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600", category: "compras" },
    { id: 613, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601", category: "direções" },
    { id: 614, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602", category: "emergência" },
    { id: 615, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603", category: "restaurante" },
    { id: 616, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604", category: "restaurante" },
    { id: 617, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605", category: "saudação" },
    { id: 618, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606", category: "apresentação" },
    { id: 619, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607", category: "apresentação" },
    { id: 620, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608", category: "estudo" },
    { id: 621, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609", category: "sobrevivência" },
    { id: 622, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610", category: "sobrevivência" },
    { id: 623, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611", category: "compras" },
    { id: 624, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612", category: "direções" },
    { id: 625, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613", category: "emergência" },
    { id: 626, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614", category: "restaurante" },
    { id: 627, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615", category: "restaurante" },
    { id: 628, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616", category: "saudação" },
    { id: 629, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617", category: "apresentação" },
    { id: 630, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618", category: "apresentação" },
    { id: 631, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619", category: "estudo" },
    { id: 632, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620", category: "sobrevivência" },
    { id: 633, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621", category: "sobrevivência" },
    { id: 634, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622", category: "compras" },
    { id: 635, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612 623", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612 623", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612 623", category: "direções" },
    { id: 636, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613 624", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613 624", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613 624", category: "emergência" },
    { id: 637, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614 625", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614 625", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614 625", category: "restaurante" },
    { id: 638, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615 626", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615 626", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615 626", category: "restaurante" },
    { id: 639, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616 627", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616 627", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616 627", category: "saudação" },
    { id: 640, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617 628", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617 628", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617 628", category: "apresentação" },
    { id: 641, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618 629", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618 629", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618 629", category: "apresentação" },
    { id: 642, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619 630", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619 630", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619 630", category: "estudo" },
    { id: 643, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620 631", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620 631", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620 631", category: "sobrevivência" },
    { id: 644, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621 632", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621 632", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621 632", category: "sobrevivência" },
    { id: 645, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622 633", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622 633", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622 633", category: "compras" },
    { id: 646, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612 623 634", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612 623 634", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612 623 634", category: "direções" },
    { id: 647, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613 624 635", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613 624 635", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613 624 635", category: "emergência" },
    { id: 648, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614 625 636", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614 625 636", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614 625 636", category: "restaurante" },
    { id: 649, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615 626 637", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615 626 637", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615 626 637", category: "restaurante" },
    { id: 650, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616 627 638", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616 627 638", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616 627 638", category: "saudação" },
    { id: 651, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617 628 639", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617 628 639", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617 628 639", category: "apresentação" },
    { id: 652, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618 629 640", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618 629 640", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618 629 640", category: "apresentação" },
    { id: 653, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619 630 641", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619 630 641", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619 630 641", category: "estudo" },
    { id: 654, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620 631 642", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620 631 642", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620 631 642", category: "sobrevivência" },
    { id: 655, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621 632 643", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621 632 643", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621 632 643", category: "sobrevivência" },
    { id: 656, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622 633 644", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622 633 644", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622 633 644", category: "compras" },
    { id: 657, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612 623 634 645", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612 623 634 645", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612 623 634 645", category: "direções" },
    { id: 658, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613 624 635 646", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613 624 635 646", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613 624 635 646", category: "emergência" },
    { id: 659, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614 625 636 647", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614 625 636 647", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614 625 636 647", category: "restaurante" },
    { id: 660, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615 626 637 648", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615 626 637 648", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615 626 637 648", category: "restaurante" },
    { id: 661, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616 627 638 649", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616 627 638 649", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616 627 638 649", category: "saudação" },
    { id: 662, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617 628 639 650", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617 628 639 650", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617 628 639 650", category: "apresentação" },
    { id: 663, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618 629 640 651", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618 629 640 651", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618 629 640 651", category: "apresentação" },
    { id: 664, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619 630 641 652", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619 630 641 652", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619 630 641 652", category: "estudo" },
    { id: 665, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620 631 642 653", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620 631 642 653", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620 631 642 653", category: "sobrevivência" },
    { id: 666, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621 632 643 654", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621 632 643 654", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621 632 643 654", category: "sobrevivência" },
    { id: 667, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622 633 644 655", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622 633 644 655", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622 633 644 655", category: "compras" },
    { id: 668, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612 623 634 645 656", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612 623 634 645 656", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612 623 634 645 656", category: "direções" },
    { id: 669, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613 624 635 646 657", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613 624 635 646 657", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613 624 635 646 657", category: "emergência" },
    { id: 670, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614 625 636 647 658", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614 625 636 647 658", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614 625 636 647 658", category: "restaurante" },
    { id: 671, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615 626 637 648 659", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615 626 637 648 659", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615 626 637 648 659", category: "restaurante" },
    { id: 672, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616 627 638 649 660", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616 627 638 649 660", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616 627 638 649 660", category: "saudação" },
    { id: 673, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617 628 639 650 661", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617 628 639 650 661", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617 628 639 650 661", category: "apresentação" },
    { id: 674, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618 629 640 651 662", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618 629 640 651 662", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618 629 640 651 662", category: "apresentação" },
    { id: 675, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619 630 641 652 663", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619 630 641 652 663", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619 630 641 652 663", category: "estudo" },
    { id: 676, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620 631 642 653 664", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620 631 642 653 664", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620 631 642 653 664", category: "sobrevivência" },
    { id: 677, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621 632 643 654 665", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621 632 643 654 665", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621 632 643 654 665", category: "sobrevivência" },
    { id: 678, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622 633 644 655 666", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622 633 644 655 666", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622 633 644 655 666", category: "compras" },
    { id: 679, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612 623 634 645 656 667", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612 623 634 645 656 667", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612 623 634 645 656 667", category: "direções" },
    { id: 680, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613 624 635 646 657 668", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613 624 635 646 657 668", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613 624 635 646 657 668", category: "emergência" },
    { id: 681, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614 625 636 647 658 669", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614 625 636 647 658 669", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614 625 636 647 658 669", category: "restaurante" },
    { id: 682, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615 626 637 648 659 670", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615 626 637 648 659 670", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615 626 637 648 659 670", category: "restaurante" },
    { id: 683, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616 627 638 649 660 671", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616 627 638 649 660 671", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616 627 638 649 660 671", category: "saudação" },
    { id: 684, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617 628 639 650 661 672", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617 628 639 650 661 672", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617 628 639 650 661 672", category: "apresentação" },
    { id: 685, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618 629 640 651 662 673", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618 629 640 651 662 673", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618 629 640 651 662 673", category: "apresentação" },
    { id: 686, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619 630 641 652 663 674", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619 630 641 652 663 674", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619 630 641 652 663 674", category: "estudo" },
    { id: 687, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620 631 642 653 664 675", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620 631 642 653 664 675", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620 631 642 653 664 675", category: "sobrevivência" },
    { id: 688, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621 632 643 654 665 676", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621 632 643 654 665 676", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621 632 643 654 665 676", category: "sobrevivência" },
    { id: 689, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622 633 644 655 666 677", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622 633 644 655 666 677", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622 633 644 655 666 677", category: "compras" },
    { id: 690, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612 623 634 645 656 667 678", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612 623 634 645 656 667 678", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612 623 634 645 656 667 678", category: "direções" },
    { id: 691, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613 624 635 646 657 668 679", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613 624 635 646 657 668 679", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613 624 635 646 657 668 679", category: "emergência" },
    { id: 692, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614 625 636 647 658 669 680", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614 625 636 647 658 669 680", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614 625 636 647 658 669 680", category: "restaurante" },
    { id: 693, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615 626 637 648 659 670 681", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615 626 637 648 659 670 681", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615 626 637 648 659 670 681", category: "restaurante" },
    { id: 694, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616 627 638 649 660 671 682", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616 627 638 649 660 671 682", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616 627 638 649 660 671 682", category: "saudação" },
    { id: 695, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617 628 639 650 661 672 683", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617 628 639 650 661 672 683", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617 628 639 650 661 672 683", category: "apresentação" },
    { id: 696, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618 629 640 651 662 673 684", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618 629 640 651 662 673 684", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618 629 640 651 662 673 684", category: "apresentação" },
    { id: 697, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619 630 641 652 663 674 685", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619 630 641 652 663 674 685", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619 630 641 652 663 674 685", category: "estudo" },
    { id: 698, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620 631 642 653 664 675 686", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620 631 642 653 664 675 686", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620 631 642 653 664 675 686", category: "sobrevivência" },
    { id: 699, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621 632 643 654 665 676 687", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621 632 643 654 665 676 687", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621 632 643 654 665 676 687", category: "sobrevivência" },
    { id: 700, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622 633 644 655 666 677 688", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622 633 644 655 666 677 688", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622 633 644 655 666 677 688", category: "compras" },
    { id: 701, russian: "Где метро? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612 623 634 645 656 667 678 689", romanization: "gde metro? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612 623 634 645 656 667 678 689", portuguese: "Onde fica o metrô? 7 18 29 40 51 62 73 84 95 106 117 128 139 150 161 172 183 194 205 216 227 238 249 260 271 282 293 304 315 326 337 348 359 370 381 392 403 414 425 436 447 458 469 480 491 502 513 524 535 546 557 568 579 590 601 612 623 634 645 656 667 678 689", category: "direções" },
    { id: 702, russian: "Мне нужна помощь 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613 624 635 646 657 668 679 690", romanization: "mne nuzhna pomoshch 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613 624 635 646 657 668 679 690", portuguese: "Eu preciso de ajuda 8 19 30 41 52 63 74 85 96 107 118 129 140 151 162 173 184 195 206 217 228 239 250 261 272 283 294 305 316 327 338 349 360 371 382 393 404 415 426 437 448 459 470 481 492 503 514 525 536 547 558 569 580 591 602 613 624 635 646 657 668 679 690", category: "emergência" },
    { id: 703, russian: "Можно счёт? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614 625 636 647 658 669 680 691", romanization: "mozhno schot? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614 625 636 647 658 669 680 691", portuguese: "Pode trazer a conta? 9 20 31 42 53 64 75 86 97 108 119 130 141 152 163 174 185 196 207 218 229 240 251 262 273 284 295 306 317 328 339 350 361 372 383 394 405 416 427 438 449 460 471 482 493 504 515 526 537 548 559 570 581 592 603 614 625 636 647 658 669 680 691", category: "restaurante" },
    { id: 704, russian: "Я хочу чай 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615 626 637 648 659 670 681 692", romanization: "ya khochu chai 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615 626 637 648 659 670 681 692", portuguese: "Eu quero chá 10 21 32 43 54 65 76 87 98 109 120 131 142 153 164 175 186 197 208 219 230 241 252 263 274 285 296 307 318 329 340 351 362 373 384 395 406 417 428 439 450 461 472 483 494 505 516 527 538 549 560 571 582 593 604 615 626 637 648 659 670 681 692", category: "restaurante" },
    { id: 705, russian: "До свидания 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616 627 638 649 660 671 682 693", romanization: "do svidaniya 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616 627 638 649 660 671 682 693", portuguese: "Até logo 11 22 33 44 55 66 77 88 99 110 121 132 143 154 165 176 187 198 209 220 231 242 253 264 275 286 297 308 319 330 341 352 363 374 385 396 407 418 429 440 451 462 473 484 495 506 517 528 539 550 561 572 583 594 605 616 627 638 649 660 671 682 693", category: "saudação" },
    { id: 706, russian: "Меня зовут Анна 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617 628 639 650 661 672 683 694", romanization: "menya zovut Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617 628 639 650 661 672 683 694", portuguese: "Meu nome é Anna 1 12 23 34 45 56 67 78 89 100 111 122 133 144 155 166 177 188 199 210 221 232 243 254 265 276 287 298 309 320 331 342 353 364 375 386 397 408 419 430 441 452 463 474 485 496 507 518 529 540 551 562 573 584 595 606 617 628 639 650 661 672 683 694", category: "apresentação" },
    { id: 707, russian: "Я из Бразилии 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618 629 640 651 662 673 684 695", romanization: "ya iz Brazilii 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618 629 640 651 662 673 684 695", portuguese: "Eu sou do Brasil 2 13 24 35 46 57 68 79 90 101 112 123 134 145 156 167 178 189 200 211 222 233 244 255 266 277 288 299 310 321 332 343 354 365 376 387 398 409 420 431 442 453 464 475 486 497 508 519 530 541 552 563 574 585 596 607 618 629 640 651 662 673 684 695", category: "apresentação" },
    { id: 708, russian: "Я учу русский 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619 630 641 652 663 674 685 696", romanization: "ya uchu russkiy 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619 630 641 652 663 674 685 696", portuguese: "Eu estudo russo 3 14 25 36 47 58 69 80 91 102 113 124 135 146 157 168 179 190 201 212 223 234 245 256 267 278 289 300 311 322 333 344 355 366 377 388 399 410 421 432 443 454 465 476 487 498 509 520 531 542 553 564 575 586 597 608 619 630 641 652 663 674 685 696", category: "estudo" },
    { id: 709, russian: "Говорите медленнее, пожалуйста 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620 631 642 653 664 675 686 697", romanization: "govorite medlenneye pozhaluysta 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620 631 642 653 664 675 686 697", portuguese: "Fale mais devagar, por favor 4 15 26 37 48 59 70 81 92 103 114 125 136 147 158 169 180 191 202 213 224 235 246 257 268 279 290 301 312 323 334 345 356 367 378 389 400 411 422 433 444 455 466 477 488 499 510 521 532 543 554 565 576 587 598 609 620 631 642 653 664 675 686 697", category: "sobrevivência" },
    { id: 710, russian: "Я не понимаю 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621 632 643 654 665 676 687 698", romanization: "ya ne ponimayu 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621 632 643 654 665 676 687 698", portuguese: "Eu não entendo 5 16 27 38 49 60 71 82 93 104 115 126 137 148 159 170 181 192 203 214 225 236 247 258 269 280 291 302 313 324 335 346 357 368 379 390 401 412 423 434 445 456 467 478 489 500 511 522 533 544 555 566 577 588 599 610 621 632 643 654 665 676 687 698", category: "sobrevivência" },
    { id: 711, russian: "Сколько это стоит? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622 633 644 655 666 677 688 699", romanization: "skolko eto stoit? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622 633 644 655 666 677 688 699", portuguese: "Quanto isso custa? 6 17 28 39 50 61 72 83 94 105 116 127 138 149 160 171 182 193 204 215 226 237 248 259 270 281 292 303 314 325 336 347 358 369 380 391 402 413 424 435 446 457 468 479 490 501 512 523 534 545 556 567 578 589 600 611 622 633 644 655 666 677 688 699", category: "compras" },
];
const lessons = [
    { id: 1, title: "Alfabeto Cirílico", level: "iniciante", xp: 23 },
    { id: 2, title: "Saudações", level: "iniciante", xp: 26 },
    { id: 3, title: "Números", level: "iniciante", xp: 29 },
    { id: 4, title: "Família", level: "iniciante", xp: 32 },
    { id: 5, title: "Comida", level: "iniciante", xp: 35 },
    { id: 6, title: "Cores", level: "iniciante", xp: 38 },
    { id: 7, title: "Transporte", level: "iniciante", xp: 41 },
    { id: 8, title: "Cidade", level: "iniciante", xp: 44 },
    { id: 9, title: "Verbos Básicos", level: "intermediário", xp: 47 },
    { id: 10, title: "Frases de Sobrevivência", level: "intermediário", xp: 50 },
    { id: 11, title: "Restaurante", level: "intermediário", xp: 53 },
    { id: 12, title: "Compras", level: "intermediário", xp: 56 },
    { id: 13, title: "Direções", level: "intermediário", xp: 59 },
    { id: 14, title: "Tempo", level: "intermediário", xp: 62 },
    { id: 15, title: "Clima", level: "intermediário", xp: 65 },
    { id: 16, title: "Pronomes", level: "intermediário", xp: 68 },
    { id: 17, title: "Casos Russos", level: "intermediário", xp: 71 },
    { id: 18, title: "Verbo Ser/Estar", level: "avançado", xp: 74 },
    { id: 19, title: "Aspecto Verbal", level: "avançado", xp: 77 },
    { id: 20, title: "Cultura Russa", level: "avançado", xp: 80 },
    { id: 21, title: "Música Russa", level: "avançado", xp: 83 },
    { id: 22, title: "Viagem", level: "avançado", xp: 86 },
    { id: 23, title: "Hotel", level: "avançado", xp: 89 },
    { id: 24, title: "Emergência", level: "avançado", xp: 92 },
    { id: 25, title: "Revisão Geral", level: "avançado", xp: 95 },
];
function readDb() {
    if (!fs.existsSync(DATA_FILE)) {
        return { users: [], progress: [], messages: [], attempts: [] };
    }
    try {
        return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    } catch (error) {
        return { users: [], progress: [], messages: [], attempts: [] };
    }
}
function writeDb(db) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}
function norm(text) {
    return String(text || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}
function nextId(list) {
    return list.length ? Math.max(...list.map(item => Number(item.id) || 0)) + 1 : 1;
}
function publicUser(user) {
    const copy = Object.assign({}, user);
    delete copy.password;
    return copy;
}
function aiAnswer(message) {
    const t = norm(message);
    const found = vocabulary.find(v => t.includes(norm(v.portuguese)) || t.includes(norm(v.russian)) || t.includes(norm(v.romanization)));
    if (found) return { text: `Em russo, ${found.portuguese} é ${found.russian}. Pronúncia: ${found.romanization}.`, russian: found.russian };
    if (t.includes('viagem')) return { text: 'Para viagem use: Где метро? Сколько это стоит? Мне нужна помощь.', russian: 'Где метро? Сколько это стоит? Мне нужна помощь.' };
    if (t.includes('gramatica') || t.includes('caso')) return { text: 'Russo tem seis casos principais: nominativo, genitivo, dativo, acusativo, instrumental e preposicional.', russian: 'Русский язык имеет шесть падежей.' };
    if (t.includes('restaurante')) return { text: 'No restaurante diga: Можно меню? Я хочу чай. Можно счёт?', russian: 'Можно меню? Я хочу чай. Можно счёт?' };
    if (t.includes('emergencia') || t.includes('ajuda')) return { text: 'Frase importante: Мне нужна помощь significa eu preciso de ajuda.', russian: 'Мне нужна помощь.' };
    const sample = phrases[Math.floor(Math.random() * phrases.length)];
    return { text: `Treino rápido: ${sample.russian} significa ${sample.portuguese}.`, russian: sample.russian };
}
app.get('/api/health', (req, res) => {
    res.json({ ok: true, name: 'PUTIRUS Max API', version: '2.0.0' });
});
app.get('/api/vocabulary', (req, res) => {
    const q = norm(req.query.q || '');
    const category = String(req.query.category || 'all');
    const limit = Math.min(Number(req.query.limit || 200), 1000);
    const data = vocabulary.filter(v => (category === 'all' || v.category === category) && (!q || norm(v.russian + ' ' + v.romanization + ' ' + v.portuguese + ' ' + v.category).includes(q))).slice(0, limit);
    res.json({ total: data.length, data });
});
app.get('/api/vocabulary/:id', (req, res) => {
    const item = vocabulary.find(v => v.id === Number(req.params.id));
    if (!item) return res.status(404).json({ error: 'Palavra não encontrada' });
    res.json(item);
});
app.get('/api/categories', (req, res) => {
    res.json([...new Set(vocabulary.map(v => v.category))].sort());
});
app.get('/api/phrases', (req, res) => {
    const q = norm(req.query.q || '');
    const limit = Math.min(Number(req.query.limit || 200), 1000);
    const data = phrases.filter(p => !q || norm(p.russian + ' ' + p.romanization + ' ' + p.portuguese + ' ' + p.category).includes(q)).slice(0, limit);
    res.json({ total: data.length, data });
});
app.get('/api/lessons', (req, res) => {
    res.json(lessons);
});
app.get('/api/lessons/:id', (req, res) => {
    const id = Number(req.params.id);
    const lesson = lessons.find(l => l.id === id);
    if (!lesson) return res.status(404).json({ error: 'Lição não encontrada' });
    const words = vocabulary.slice((id - 1) * 12, (id - 1) * 12 + 12);
    res.json({ lesson, words });
});
app.post('/api/register', (req, res) => {
    const db = readDb();
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '').trim();
    if (!name || !email || !password) return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
    if (db.users.some(u => u.email === email)) return res.status(409).json({ error: 'Email já cadastrado' });
    const user = { id: nextId(db.users), name, email, password, createdAt: new Date().toISOString(), xp: 0, level: 1, hearts: 5, streak: 0 };
    db.users.push(user);
    writeDb(db);
    res.status(201).json(publicUser(user));
});
app.post('/api/login', (req, res) => {
    const db = readDb();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '').trim();
    const user = db.users.find(u => u.email === email && u.password === password);
    if (!user) return res.status(401).json({ error: 'Login inválido' });
    res.json(publicUser(user));
});
app.get('/api/users/:id/progress', (req, res) => {
    const db = readDb();
    const userId = Number(req.params.id);
    const progress = db.progress.filter(p => p.userId === userId);
    const attempts = db.attempts.filter(a => a.userId === userId);
    res.json({ progress, attempts });
});
app.post('/api/users/:id/progress', (req, res) => {
    const db = readDb();
    const userId = Number(req.params.id);
    const item = { id: nextId(db.progress), userId, type: req.body.type || 'generic', refId: req.body.refId || null, value: req.body.value || true, createdAt: new Date().toISOString() };
    db.progress.push(item);
    writeDb(db);
    res.status(201).json(item);
});
app.post('/api/attempts', (req, res) => {
    const db = readDb();
    const attempt = { id: nextId(db.attempts), userId: Number(req.body.userId || 0), mode: req.body.mode || 'quiz', question: req.body.question || '', answer: req.body.answer || '', correct: Boolean(req.body.correct), createdAt: new Date().toISOString() };
    db.attempts.push(attempt);
    writeDb(db);
    res.status(201).json(attempt);
});
app.post('/api/chat', (req, res) => {
    const db = readDb();
    const message = String(req.body.message || '').trim();
    if (!message) return res.status(400).json({ error: 'Mensagem vazia' });
    const answer = aiAnswer(message);
    const row = { id: nextId(db.messages), userId: Number(req.body.userId || 0), message, answer: answer.text, russian: answer.russian, createdAt: new Date().toISOString() };
    db.messages.push(row);
    writeDb(db);
    res.json(row);
});
app.get('/api/review', (req, res) => {
    const count = Math.min(Number(req.query.count || 10), 50);
    const data = [...vocabulary].sort(() => Math.random() - 0.5).slice(0, count).map(v => ({ prompt: v.russian, answer: v.portuguese, romanization: v.romanization }));
    res.json(data);
});
app.get('/api/export', (req, res) => {
    res.json(readDb());
});
app.delete('/api/reset', (req, res) => {
    writeDb({ users: [], progress: [], messages: [], attempts: [] });
    res.json({ ok: true });
});
app.use((req, res) => {
    res.status(404).json({ error: 'Rota não encontrada' });
});

const extraLessons = [
  { id: "a1-01", level: "A1", title: "Saudações", items: ["Привет", "Здравствуйте", "Доброе утро", "До свидания"] },
  { id: "a1-02", level: "A1", title: "Apresentação", items: ["Меня зовут", "Я из Бразилии", "Как вас зовут?"] },
  { id: "a2-01", level: "A2", title: "Gostos", items: ["Мне нравится", "Я люблю", "Мне это не нравится"] }
];

app.get("/api/course", (req, res) => {
  res.json({ success: true, lessons: extraLessons });
});

app.get("/api/course/:id", (req, res) => {
  const lesson = extraLessons.find(item => item.id === req.params.id);
  if (!lesson) return res.status(404).json({ success: false, message: "Aula não encontrada" });
  res.json({ success: true, lesson });
});

app.post("/api/review", (req, res) => {
  const item = {
    id: Date.now(),
    russian: req.body.russian,
    portuguese: req.body.portuguese,
    reason: req.body.reason || "Revisão",
    createdAt: new Date().toISOString()
  };
  db.reviews = db.reviews || [];
  db.reviews.push(item);
  res.json({ success: true, item });
});

app.get("/api/review", (req, res) => {
  db.reviews = db.reviews || [];
  res.json({ success: true, reviews: db.reviews });
});

app.post("/api/notes", (req, res) => {
  const note = {
    id: Date.now(),
    title: req.body.title || "Anotação",
    body: req.body.body || "",
    createdAt: new Date().toISOString()
  };
  db.notes = db.notes || [];
  db.notes.unshift(note);
  res.json({ success: true, note });
});

app.get("/api/notes", (req, res) => {
  db.notes = db.notes || [];
  res.json({ success: true, notes: db.notes });
});

app.listen(PORT, () => {
    console.log(`PUTIRUS Max rodando em http://localhost:${PORT}`);
});
const extendedPracticeBank = [
    { id: 1, mode: "extra", prompt: "Treino extra 1", answer: "Ответ 1", xp: 6 },
    { id: 2, mode: "extra", prompt: "Treino extra 2", answer: "Ответ 2", xp: 7 },
    { id: 3, mode: "extra", prompt: "Treino extra 3", answer: "Ответ 3", xp: 8 },
    { id: 4, mode: "extra", prompt: "Treino extra 4", answer: "Ответ 4", xp: 9 },
    { id: 5, mode: "extra", prompt: "Treino extra 5", answer: "Ответ 5", xp: 10 },
    { id: 6, mode: "extra", prompt: "Treino extra 6", answer: "Ответ 6", xp: 11 },
    { id: 7, mode: "extra", prompt: "Treino extra 7", answer: "Ответ 7", xp: 12 },
    { id: 8, mode: "extra", prompt: "Treino extra 8", answer: "Ответ 8", xp: 13 },
    { id: 9, mode: "extra", prompt: "Treino extra 9", answer: "Ответ 9", xp: 14 },
    { id: 10, mode: "extra", prompt: "Treino extra 10", answer: "Ответ 10", xp: 5 },
    { id: 11, mode: "extra", prompt: "Treino extra 11", answer: "Ответ 11", xp: 6 },
    { id: 12, mode: "extra", prompt: "Treino extra 12", answer: "Ответ 12", xp: 7 },
    { id: 13, mode: "extra", prompt: "Treino extra 13", answer: "Ответ 13", xp: 8 },
    { id: 14, mode: "extra", prompt: "Treino extra 14", answer: "Ответ 14", xp: 9 },
    { id: 15, mode: "extra", prompt: "Treino extra 15", answer: "Ответ 15", xp: 10 },
    { id: 16, mode: "extra", prompt: "Treino extra 16", answer: "Ответ 16", xp: 11 },
    { id: 17, mode: "extra", prompt: "Treino extra 17", answer: "Ответ 17", xp: 12 },
    { id: 18, mode: "extra", prompt: "Treino extra 18", answer: "Ответ 18", xp: 13 },
    { id: 19, mode: "extra", prompt: "Treino extra 19", answer: "Ответ 19", xp: 14 },
    { id: 20, mode: "extra", prompt: "Treino extra 20", answer: "Ответ 20", xp: 5 },
    { id: 21, mode: "extra", prompt: "Treino extra 21", answer: "Ответ 21", xp: 6 },
    { id: 22, mode: "extra", prompt: "Treino extra 22", answer: "Ответ 22", xp: 7 },
    { id: 23, mode: "extra", prompt: "Treino extra 23", answer: "Ответ 23", xp: 8 },
    { id: 24, mode: "extra", prompt: "Treino extra 24", answer: "Ответ 24", xp: 9 },
    { id: 25, mode: "extra", prompt: "Treino extra 25", answer: "Ответ 25", xp: 10 },
    { id: 26, mode: "extra", prompt: "Treino extra 26", answer: "Ответ 26", xp: 11 },
    { id: 27, mode: "extra", prompt: "Treino extra 27", answer: "Ответ 27", xp: 12 },
    { id: 28, mode: "extra", prompt: "Treino extra 28", answer: "Ответ 28", xp: 13 },
    { id: 29, mode: "extra", prompt: "Treino extra 29", answer: "Ответ 29", xp: 14 },
    { id: 30, mode: "extra", prompt: "Treino extra 30", answer: "Ответ 30", xp: 5 },
    { id: 31, mode: "extra", prompt: "Treino extra 31", answer: "Ответ 31", xp: 6 },
    { id: 32, mode: "extra", prompt: "Treino extra 32", answer: "Ответ 32", xp: 7 },
    { id: 33, mode: "extra", prompt: "Treino extra 33", answer: "Ответ 33", xp: 8 },
    { id: 34, mode: "extra", prompt: "Treino extra 34", answer: "Ответ 34", xp: 9 },
    { id: 35, mode: "extra", prompt: "Treino extra 35", answer: "Ответ 35", xp: 10 },
    { id: 36, mode: "extra", prompt: "Treino extra 36", answer: "Ответ 36", xp: 11 },
    { id: 37, mode: "extra", prompt: "Treino extra 37", answer: "Ответ 37", xp: 12 },
    { id: 38, mode: "extra", prompt: "Treino extra 38", answer: "Ответ 38", xp: 13 },
    { id: 39, mode: "extra", prompt: "Treino extra 39", answer: "Ответ 39", xp: 14 },
    { id: 40, mode: "extra", prompt: "Treino extra 40", answer: "Ответ 40", xp: 5 },
    { id: 41, mode: "extra", prompt: "Treino extra 41", answer: "Ответ 41", xp: 6 },
    { id: 42, mode: "extra", prompt: "Treino extra 42", answer: "Ответ 42", xp: 7 },
    { id: 43, mode: "extra", prompt: "Treino extra 43", answer: "Ответ 43", xp: 8 },
    { id: 44, mode: "extra", prompt: "Treino extra 44", answer: "Ответ 44", xp: 9 },
    { id: 45, mode: "extra", prompt: "Treino extra 45", answer: "Ответ 45", xp: 10 },
    { id: 46, mode: "extra", prompt: "Treino extra 46", answer: "Ответ 46", xp: 11 },
    { id: 47, mode: "extra", prompt: "Treino extra 47", answer: "Ответ 47", xp: 12 },
    { id: 48, mode: "extra", prompt: "Treino extra 48", answer: "Ответ 48", xp: 13 },
    { id: 49, mode: "extra", prompt: "Treino extra 49", answer: "Ответ 49", xp: 14 },
    { id: 50, mode: "extra", prompt: "Treino extra 50", answer: "Ответ 50", xp: 5 },
    { id: 51, mode: "extra", prompt: "Treino extra 51", answer: "Ответ 51", xp: 6 },
    { id: 52, mode: "extra", prompt: "Treino extra 52", answer: "Ответ 52", xp: 7 },
    { id: 53, mode: "extra", prompt: "Treino extra 53", answer: "Ответ 53", xp: 8 },
    { id: 54, mode: "extra", prompt: "Treino extra 54", answer: "Ответ 54", xp: 9 },
    { id: 55, mode: "extra", prompt: "Treino extra 55", answer: "Ответ 55", xp: 10 },
    { id: 56, mode: "extra", prompt: "Treino extra 56", answer: "Ответ 56", xp: 11 },
    { id: 57, mode: "extra", prompt: "Treino extra 57", answer: "Ответ 57", xp: 12 },
    { id: 58, mode: "extra", prompt: "Treino extra 58", answer: "Ответ 58", xp: 13 },
    { id: 59, mode: "extra", prompt: "Treino extra 59", answer: "Ответ 59", xp: 14 },
    { id: 60, mode: "extra", prompt: "Treino extra 60", answer: "Ответ 60", xp: 5 },
    { id: 61, mode: "extra", prompt: "Treino extra 61", answer: "Ответ 61", xp: 6 },
    { id: 62, mode: "extra", prompt: "Treino extra 62", answer: "Ответ 62", xp: 7 },
    { id: 63, mode: "extra", prompt: "Treino extra 63", answer: "Ответ 63", xp: 8 },
    { id: 64, mode: "extra", prompt: "Treino extra 64", answer: "Ответ 64", xp: 9 },
    { id: 65, mode: "extra", prompt: "Treino extra 65", answer: "Ответ 65", xp: 10 },
    { id: 66, mode: "extra", prompt: "Treino extra 66", answer: "Ответ 66", xp: 11 },
    { id: 67, mode: "extra", prompt: "Treino extra 67", answer: "Ответ 67", xp: 12 },
    { id: 68, mode: "extra", prompt: "Treino extra 68", answer: "Ответ 68", xp: 13 },
    { id: 69, mode: "extra", prompt: "Treino extra 69", answer: "Ответ 69", xp: 14 },
    { id: 70, mode: "extra", prompt: "Treino extra 70", answer: "Ответ 70", xp: 5 },
    { id: 71, mode: "extra", prompt: "Treino extra 71", answer: "Ответ 71", xp: 6 },
    { id: 72, mode: "extra", prompt: "Treino extra 72", answer: "Ответ 72", xp: 7 },
    { id: 73, mode: "extra", prompt: "Treino extra 73", answer: "Ответ 73", xp: 8 },
    { id: 74, mode: "extra", prompt: "Treino extra 74", answer: "Ответ 74", xp: 9 },
    { id: 75, mode: "extra", prompt: "Treino extra 75", answer: "Ответ 75", xp: 10 },
    { id: 76, mode: "extra", prompt: "Treino extra 76", answer: "Ответ 76", xp: 11 },
    { id: 77, mode: "extra", prompt: "Treino extra 77", answer: "Ответ 77", xp: 12 },
    { id: 78, mode: "extra", prompt: "Treino extra 78", answer: "Ответ 78", xp: 13 },
    { id: 79, mode: "extra", prompt: "Treino extra 79", answer: "Ответ 79", xp: 14 },
    { id: 80, mode: "extra", prompt: "Treino extra 80", answer: "Ответ 80", xp: 5 },
    { id: 81, mode: "extra", prompt: "Treino extra 81", answer: "Ответ 81", xp: 6 },
    { id: 82, mode: "extra", prompt: "Treino extra 82", answer: "Ответ 82", xp: 7 },
    { id: 83, mode: "extra", prompt: "Treino extra 83", answer: "Ответ 83", xp: 8 },
    { id: 84, mode: "extra", prompt: "Treino extra 84", answer: "Ответ 84", xp: 9 },
    { id: 85, mode: "extra", prompt: "Treino extra 85", answer: "Ответ 85", xp: 10 },
    { id: 86, mode: "extra", prompt: "Treino extra 86", answer: "Ответ 86", xp: 11 },
    { id: 87, mode: "extra", prompt: "Treino extra 87", answer: "Ответ 87", xp: 12 },
    { id: 88, mode: "extra", prompt: "Treino extra 88", answer: "Ответ 88", xp: 13 },
    { id: 89, mode: "extra", prompt: "Treino extra 89", answer: "Ответ 89", xp: 14 },
    { id: 90, mode: "extra", prompt: "Treino extra 90", answer: "Ответ 90", xp: 5 },
    { id: 91, mode: "extra", prompt: "Treino extra 91", answer: "Ответ 91", xp: 6 },
    { id: 92, mode: "extra", prompt: "Treino extra 92", answer: "Ответ 92", xp: 7 },
    { id: 93, mode: "extra", prompt: "Treino extra 93", answer: "Ответ 93", xp: 8 },
    { id: 94, mode: "extra", prompt: "Treino extra 94", answer: "Ответ 94", xp: 9 },
    { id: 95, mode: "extra", prompt: "Treino extra 95", answer: "Ответ 95", xp: 10 },
    { id: 96, mode: "extra", prompt: "Treino extra 96", answer: "Ответ 96", xp: 11 },
    { id: 97, mode: "extra", prompt: "Treino extra 97", answer: "Ответ 97", xp: 12 },
    { id: 98, mode: "extra", prompt: "Treino extra 98", answer: "Ответ 98", xp: 13 },
    { id: 99, mode: "extra", prompt: "Treino extra 99", answer: "Ответ 99", xp: 14 },
    { id: 100, mode: "extra", prompt: "Treino extra 100", answer: "Ответ 100", xp: 5 },
    { id: 101, mode: "extra", prompt: "Treino extra 101", answer: "Ответ 101", xp: 6 },
    { id: 102, mode: "extra", prompt: "Treino extra 102", answer: "Ответ 102", xp: 7 },
    { id: 103, mode: "extra", prompt: "Treino extra 103", answer: "Ответ 103", xp: 8 },
    { id: 104, mode: "extra", prompt: "Treino extra 104", answer: "Ответ 104", xp: 9 },
    { id: 105, mode: "extra", prompt: "Treino extra 105", answer: "Ответ 105", xp: 10 },
    { id: 106, mode: "extra", prompt: "Treino extra 106", answer: "Ответ 106", xp: 11 },
    { id: 107, mode: "extra", prompt: "Treino extra 107", answer: "Ответ 107", xp: 12 },
    { id: 108, mode: "extra", prompt: "Treino extra 108", answer: "Ответ 108", xp: 13 },
    { id: 109, mode: "extra", prompt: "Treino extra 109", answer: "Ответ 109", xp: 14 },
    { id: 110, mode: "extra", prompt: "Treino extra 110", answer: "Ответ 110", xp: 5 },
    { id: 111, mode: "extra", prompt: "Treino extra 111", answer: "Ответ 111", xp: 6 },
    { id: 112, mode: "extra", prompt: "Treino extra 112", answer: "Ответ 112", xp: 7 },
    { id: 113, mode: "extra", prompt: "Treino extra 113", answer: "Ответ 113", xp: 8 },
    { id: 114, mode: "extra", prompt: "Treino extra 114", answer: "Ответ 114", xp: 9 },
    { id: 115, mode: "extra", prompt: "Treino extra 115", answer: "Ответ 115", xp: 10 },
    { id: 116, mode: "extra", prompt: "Treino extra 116", answer: "Ответ 116", xp: 11 },
    { id: 117, mode: "extra", prompt: "Treino extra 117", answer: "Ответ 117", xp: 12 },
    { id: 118, mode: "extra", prompt: "Treino extra 118", answer: "Ответ 118", xp: 13 },
    { id: 119, mode: "extra", prompt: "Treino extra 119", answer: "Ответ 119", xp: 14 },
    { id: 120, mode: "extra", prompt: "Treino extra 120", answer: "Ответ 120", xp: 5 },
    { id: 121, mode: "extra", prompt: "Treino extra 121", answer: "Ответ 121", xp: 6 },
    { id: 122, mode: "extra", prompt: "Treino extra 122", answer: "Ответ 122", xp: 7 },
    { id: 123, mode: "extra", prompt: "Treino extra 123", answer: "Ответ 123", xp: 8 },
    { id: 124, mode: "extra", prompt: "Treino extra 124", answer: "Ответ 124", xp: 9 },
    { id: 125, mode: "extra", prompt: "Treino extra 125", answer: "Ответ 125", xp: 10 },
    { id: 126, mode: "extra", prompt: "Treino extra 126", answer: "Ответ 126", xp: 11 },
    { id: 127, mode: "extra", prompt: "Treino extra 127", answer: "Ответ 127", xp: 12 },
    { id: 128, mode: "extra", prompt: "Treino extra 128", answer: "Ответ 128", xp: 13 },
    { id: 129, mode: "extra", prompt: "Treino extra 129", answer: "Ответ 129", xp: 14 },
    { id: 130, mode: "extra", prompt: "Treino extra 130", answer: "Ответ 130", xp: 5 },
    { id: 131, mode: "extra", prompt: "Treino extra 131", answer: "Ответ 131", xp: 6 },
    { id: 132, mode: "extra", prompt: "Treino extra 132", answer: "Ответ 132", xp: 7 },
    { id: 133, mode: "extra", prompt: "Treino extra 133", answer: "Ответ 133", xp: 8 },
    { id: 134, mode: "extra", prompt: "Treino extra 134", answer: "Ответ 134", xp: 9 },
    { id: 135, mode: "extra", prompt: "Treino extra 135", answer: "Ответ 135", xp: 10 },
    { id: 136, mode: "extra", prompt: "Treino extra 136", answer: "Ответ 136", xp: 11 },
    { id: 137, mode: "extra", prompt: "Treino extra 137", answer: "Ответ 137", xp: 12 },
    { id: 138, mode: "extra", prompt: "Treino extra 138", answer: "Ответ 138", xp: 13 },
    { id: 139, mode: "extra", prompt: "Treino extra 139", answer: "Ответ 139", xp: 14 },
    { id: 140, mode: "extra", prompt: "Treino extra 140", answer: "Ответ 140", xp: 5 },
    { id: 141, mode: "extra", prompt: "Treino extra 141", answer: "Ответ 141", xp: 6 },
    { id: 142, mode: "extra", prompt: "Treino extra 142", answer: "Ответ 142", xp: 7 },
    { id: 143, mode: "extra", prompt: "Treino extra 143", answer: "Ответ 143", xp: 8 },
    { id: 144, mode: "extra", prompt: "Treino extra 144", answer: "Ответ 144", xp: 9 },
    { id: 145, mode: "extra", prompt: "Treino extra 145", answer: "Ответ 145", xp: 10 },
    { id: 146, mode: "extra", prompt: "Treino extra 146", answer: "Ответ 146", xp: 11 },
    { id: 147, mode: "extra", prompt: "Treino extra 147", answer: "Ответ 147", xp: 12 },
    { id: 148, mode: "extra", prompt: "Treino extra 148", answer: "Ответ 148", xp: 13 },
    { id: 149, mode: "extra", prompt: "Treino extra 149", answer: "Ответ 149", xp: 14 },
    { id: 150, mode: "extra", prompt: "Treino extra 150", answer: "Ответ 150", xp: 5 },
    { id: 151, mode: "extra", prompt: "Treino extra 151", answer: "Ответ 151", xp: 6 },
    { id: 152, mode: "extra", prompt: "Treino extra 152", answer: "Ответ 152", xp: 7 },
    { id: 153, mode: "extra", prompt: "Treino extra 153", answer: "Ответ 153", xp: 8 },
    { id: 154, mode: "extra", prompt: "Treino extra 154", answer: "Ответ 154", xp: 9 },
    { id: 155, mode: "extra", prompt: "Treino extra 155", answer: "Ответ 155", xp: 10 },
    { id: 156, mode: "extra", prompt: "Treino extra 156", answer: "Ответ 156", xp: 11 },
    { id: 157, mode: "extra", prompt: "Treino extra 157", answer: "Ответ 157", xp: 12 },
    { id: 158, mode: "extra", prompt: "Treino extra 158", answer: "Ответ 158", xp: 13 },
    { id: 159, mode: "extra", prompt: "Treino extra 159", answer: "Ответ 159", xp: 14 },
    { id: 160, mode: "extra", prompt: "Treino extra 160", answer: "Ответ 160", xp: 5 },
    { id: 161, mode: "extra", prompt: "Treino extra 161", answer: "Ответ 161", xp: 6 },
    { id: 162, mode: "extra", prompt: "Treino extra 162", answer: "Ответ 162", xp: 7 },
    { id: 163, mode: "extra", prompt: "Treino extra 163", answer: "Ответ 163", xp: 8 },
    { id: 164, mode: "extra", prompt: "Treino extra 164", answer: "Ответ 164", xp: 9 },
    { id: 165, mode: "extra", prompt: "Treino extra 165", answer: "Ответ 165", xp: 10 },
    { id: 166, mode: "extra", prompt: "Treino extra 166", answer: "Ответ 166", xp: 11 },
    { id: 167, mode: "extra", prompt: "Treino extra 167", answer: "Ответ 167", xp: 12 },
    { id: 168, mode: "extra", prompt: "Treino extra 168", answer: "Ответ 168", xp: 13 },
    { id: 169, mode: "extra", prompt: "Treino extra 169", answer: "Ответ 169", xp: 14 },
    { id: 170, mode: "extra", prompt: "Treino extra 170", answer: "Ответ 170", xp: 5 },
    { id: 171, mode: "extra", prompt: "Treino extra 171", answer: "Ответ 171", xp: 6 },
    { id: 172, mode: "extra", prompt: "Treino extra 172", answer: "Ответ 172", xp: 7 },
    { id: 173, mode: "extra", prompt: "Treino extra 173", answer: "Ответ 173", xp: 8 },
    { id: 174, mode: "extra", prompt: "Treino extra 174", answer: "Ответ 174", xp: 9 },
    { id: 175, mode: "extra", prompt: "Treino extra 175", answer: "Ответ 175", xp: 10 },
    { id: 176, mode: "extra", prompt: "Treino extra 176", answer: "Ответ 176", xp: 11 },
    { id: 177, mode: "extra", prompt: "Treino extra 177", answer: "Ответ 177", xp: 12 },
    { id: 178, mode: "extra", prompt: "Treino extra 178", answer: "Ответ 178", xp: 13 },
    { id: 179, mode: "extra", prompt: "Treino extra 179", answer: "Ответ 179", xp: 14 },
    { id: 180, mode: "extra", prompt: "Treino extra 180", answer: "Ответ 180", xp: 5 },
    { id: 181, mode: "extra", prompt: "Treino extra 181", answer: "Ответ 181", xp: 6 },
    { id: 182, mode: "extra", prompt: "Treino extra 182", answer: "Ответ 182", xp: 7 },
    { id: 183, mode: "extra", prompt: "Treino extra 183", answer: "Ответ 183", xp: 8 },
    { id: 184, mode: "extra", prompt: "Treino extra 184", answer: "Ответ 184", xp: 9 },
    { id: 185, mode: "extra", prompt: "Treino extra 185", answer: "Ответ 185", xp: 10 },
    { id: 186, mode: "extra", prompt: "Treino extra 186", answer: "Ответ 186", xp: 11 },
    { id: 187, mode: "extra", prompt: "Treino extra 187", answer: "Ответ 187", xp: 12 },
    { id: 188, mode: "extra", prompt: "Treino extra 188", answer: "Ответ 188", xp: 13 },
    { id: 189, mode: "extra", prompt: "Treino extra 189", answer: "Ответ 189", xp: 14 },
    { id: 190, mode: "extra", prompt: "Treino extra 190", answer: "Ответ 190", xp: 5 },
    { id: 191, mode: "extra", prompt: "Treino extra 191", answer: "Ответ 191", xp: 6 },
    { id: 192, mode: "extra", prompt: "Treino extra 192", answer: "Ответ 192", xp: 7 },
    { id: 193, mode: "extra", prompt: "Treino extra 193", answer: "Ответ 193", xp: 8 },
    { id: 194, mode: "extra", prompt: "Treino extra 194", answer: "Ответ 194", xp: 9 },
    { id: 195, mode: "extra", prompt: "Treino extra 195", answer: "Ответ 195", xp: 10 },
    { id: 196, mode: "extra", prompt: "Treino extra 196", answer: "Ответ 196", xp: 11 },
    { id: 197, mode: "extra", prompt: "Treino extra 197", answer: "Ответ 197", xp: 12 },
    { id: 198, mode: "extra", prompt: "Treino extra 198", answer: "Ответ 198", xp: 13 },
    { id: 199, mode: "extra", prompt: "Treino extra 199", answer: "Ответ 199", xp: 14 },
    { id: 200, mode: "extra", prompt: "Treino extra 200", answer: "Ответ 200", xp: 5 },
    { id: 201, mode: "extra", prompt: "Treino extra 201", answer: "Ответ 201", xp: 6 },
    { id: 202, mode: "extra", prompt: "Treino extra 202", answer: "Ответ 202", xp: 7 },
    { id: 203, mode: "extra", prompt: "Treino extra 203", answer: "Ответ 203", xp: 8 },
    { id: 204, mode: "extra", prompt: "Treino extra 204", answer: "Ответ 204", xp: 9 },
    { id: 205, mode: "extra", prompt: "Treino extra 205", answer: "Ответ 205", xp: 10 },
    { id: 206, mode: "extra", prompt: "Treino extra 206", answer: "Ответ 206", xp: 11 },
    { id: 207, mode: "extra", prompt: "Treino extra 207", answer: "Ответ 207", xp: 12 },
    { id: 208, mode: "extra", prompt: "Treino extra 208", answer: "Ответ 208", xp: 13 },
    { id: 209, mode: "extra", prompt: "Treino extra 209", answer: "Ответ 209", xp: 14 },
    { id: 210, mode: "extra", prompt: "Treino extra 210", answer: "Ответ 210", xp: 5 },
    { id: 211, mode: "extra", prompt: "Treino extra 211", answer: "Ответ 211", xp: 6 },
    { id: 212, mode: "extra", prompt: "Treino extra 212", answer: "Ответ 212", xp: 7 },
    { id: 213, mode: "extra", prompt: "Treino extra 213", answer: "Ответ 213", xp: 8 },
    { id: 214, mode: "extra", prompt: "Treino extra 214", answer: "Ответ 214", xp: 9 },
    { id: 215, mode: "extra", prompt: "Treino extra 215", answer: "Ответ 215", xp: 10 },
    { id: 216, mode: "extra", prompt: "Treino extra 216", answer: "Ответ 216", xp: 11 },
    { id: 217, mode: "extra", prompt: "Treino extra 217", answer: "Ответ 217", xp: 12 },
    { id: 218, mode: "extra", prompt: "Treino extra 218", answer: "Ответ 218", xp: 13 },
    { id: 219, mode: "extra", prompt: "Treino extra 219", answer: "Ответ 219", xp: 14 },
    { id: 220, mode: "extra", prompt: "Treino extra 220", answer: "Ответ 220", xp: 5 },
    { id: 221, mode: "extra", prompt: "Treino extra 221", answer: "Ответ 221", xp: 6 },
    { id: 222, mode: "extra", prompt: "Treino extra 222", answer: "Ответ 222", xp: 7 },
    { id: 223, mode: "extra", prompt: "Treino extra 223", answer: "Ответ 223", xp: 8 },
    { id: 224, mode: "extra", prompt: "Treino extra 224", answer: "Ответ 224", xp: 9 },
    { id: 225, mode: "extra", prompt: "Treino extra 225", answer: "Ответ 225", xp: 10 },
    { id: 226, mode: "extra", prompt: "Treino extra 226", answer: "Ответ 226", xp: 11 },
    { id: 227, mode: "extra", prompt: "Treino extra 227", answer: "Ответ 227", xp: 12 },
    { id: 228, mode: "extra", prompt: "Treino extra 228", answer: "Ответ 228", xp: 13 },
    { id: 229, mode: "extra", prompt: "Treino extra 229", answer: "Ответ 229", xp: 14 },
    { id: 230, mode: "extra", prompt: "Treino extra 230", answer: "Ответ 230", xp: 5 },
    { id: 231, mode: "extra", prompt: "Treino extra 231", answer: "Ответ 231", xp: 6 },
    { id: 232, mode: "extra", prompt: "Treino extra 232", answer: "Ответ 232", xp: 7 },
    { id: 233, mode: "extra", prompt: "Treino extra 233", answer: "Ответ 233", xp: 8 },
    { id: 234, mode: "extra", prompt: "Treino extra 234", answer: "Ответ 234", xp: 9 },
    { id: 235, mode: "extra", prompt: "Treino extra 235", answer: "Ответ 235", xp: 10 },
    { id: 236, mode: "extra", prompt: "Treino extra 236", answer: "Ответ 236", xp: 11 },
    { id: 237, mode: "extra", prompt: "Treino extra 237", answer: "Ответ 237", xp: 12 },
    { id: 238, mode: "extra", prompt: "Treino extra 238", answer: "Ответ 238", xp: 13 },
    { id: 239, mode: "extra", prompt: "Treino extra 239", answer: "Ответ 239", xp: 14 },
    { id: 240, mode: "extra", prompt: "Treino extra 240", answer: "Ответ 240", xp: 5 },
    { id: 241, mode: "extra", prompt: "Treino extra 241", answer: "Ответ 241", xp: 6 },
    { id: 242, mode: "extra", prompt: "Treino extra 242", answer: "Ответ 242", xp: 7 },
    { id: 243, mode: "extra", prompt: "Treino extra 243", answer: "Ответ 243", xp: 8 },
    { id: 244, mode: "extra", prompt: "Treino extra 244", answer: "Ответ 244", xp: 9 },
    { id: 245, mode: "extra", prompt: "Treino extra 245", answer: "Ответ 245", xp: 10 },
    { id: 246, mode: "extra", prompt: "Treino extra 246", answer: "Ответ 246", xp: 11 },
    { id: 247, mode: "extra", prompt: "Treino extra 247", answer: "Ответ 247", xp: 12 },
    { id: 248, mode: "extra", prompt: "Treino extra 248", answer: "Ответ 248", xp: 13 },
    { id: 249, mode: "extra", prompt: "Treino extra 249", answer: "Ответ 249", xp: 14 },
    { id: 250, mode: "extra", prompt: "Treino extra 250", answer: "Ответ 250", xp: 5 },
    { id: 251, mode: "extra", prompt: "Treino extra 251", answer: "Ответ 251", xp: 6 },
    { id: 252, mode: "extra", prompt: "Treino extra 252", answer: "Ответ 252", xp: 7 },
    { id: 253, mode: "extra", prompt: "Treino extra 253", answer: "Ответ 253", xp: 8 },
    { id: 254, mode: "extra", prompt: "Treino extra 254", answer: "Ответ 254", xp: 9 },
    { id: 255, mode: "extra", prompt: "Treino extra 255", answer: "Ответ 255", xp: 10 },
    { id: 256, mode: "extra", prompt: "Treino extra 256", answer: "Ответ 256", xp: 11 },
    { id: 257, mode: "extra", prompt: "Treino extra 257", answer: "Ответ 257", xp: 12 },
    { id: 258, mode: "extra", prompt: "Treino extra 258", answer: "Ответ 258", xp: 13 },
    { id: 259, mode: "extra", prompt: "Treino extra 259", answer: "Ответ 259", xp: 14 },
    { id: 260, mode: "extra", prompt: "Treino extra 260", answer: "Ответ 260", xp: 5 },
    { id: 261, mode: "extra", prompt: "Treino extra 261", answer: "Ответ 261", xp: 6 },
    { id: 262, mode: "extra", prompt: "Treino extra 262", answer: "Ответ 262", xp: 7 },
    { id: 263, mode: "extra", prompt: "Treino extra 263", answer: "Ответ 263", xp: 8 },
    { id: 264, mode: "extra", prompt: "Treino extra 264", answer: "Ответ 264", xp: 9 },
    { id: 265, mode: "extra", prompt: "Treino extra 265", answer: "Ответ 265", xp: 10 },
    { id: 266, mode: "extra", prompt: "Treino extra 266", answer: "Ответ 266", xp: 11 },
    { id: 267, mode: "extra", prompt: "Treino extra 267", answer: "Ответ 267", xp: 12 },
    { id: 268, mode: "extra", prompt: "Treino extra 268", answer: "Ответ 268", xp: 13 },
    { id: 269, mode: "extra", prompt: "Treino extra 269", answer: "Ответ 269", xp: 14 },
    { id: 270, mode: "extra", prompt: "Treino extra 270", answer: "Ответ 270", xp: 5 },
    { id: 271, mode: "extra", prompt: "Treino extra 271", answer: "Ответ 271", xp: 6 },
    { id: 272, mode: "extra", prompt: "Treino extra 272", answer: "Ответ 272", xp: 7 },
    { id: 273, mode: "extra", prompt: "Treino extra 273", answer: "Ответ 273", xp: 8 },
    { id: 274, mode: "extra", prompt: "Treino extra 274", answer: "Ответ 274", xp: 9 },
    { id: 275, mode: "extra", prompt: "Treino extra 275", answer: "Ответ 275", xp: 10 },
    { id: 276, mode: "extra", prompt: "Treino extra 276", answer: "Ответ 276", xp: 11 },
    { id: 277, mode: "extra", prompt: "Treino extra 277", answer: "Ответ 277", xp: 12 },
    { id: 278, mode: "extra", prompt: "Treino extra 278", answer: "Ответ 278", xp: 13 },
    { id: 279, mode: "extra", prompt: "Treino extra 279", answer: "Ответ 279", xp: 14 },
    { id: 280, mode: "extra", prompt: "Treino extra 280", answer: "Ответ 280", xp: 5 },
    { id: 281, mode: "extra", prompt: "Treino extra 281", answer: "Ответ 281", xp: 6 },
    { id: 282, mode: "extra", prompt: "Treino extra 282", answer: "Ответ 282", xp: 7 },
    { id: 283, mode: "extra", prompt: "Treino extra 283", answer: "Ответ 283", xp: 8 },
    { id: 284, mode: "extra", prompt: "Treino extra 284", answer: "Ответ 284", xp: 9 },
    { id: 285, mode: "extra", prompt: "Treino extra 285", answer: "Ответ 285", xp: 10 },
    { id: 286, mode: "extra", prompt: "Treino extra 286", answer: "Ответ 286", xp: 11 },
    { id: 287, mode: "extra", prompt: "Treino extra 287", answer: "Ответ 287", xp: 12 },
    { id: 288, mode: "extra", prompt: "Treino extra 288", answer: "Ответ 288", xp: 13 },
    { id: 289, mode: "extra", prompt: "Treino extra 289", answer: "Ответ 289", xp: 14 },
    { id: 290, mode: "extra", prompt: "Treino extra 290", answer: "Ответ 290", xp: 5 },
    { id: 291, mode: "extra", prompt: "Treino extra 291", answer: "Ответ 291", xp: 6 },
    { id: 292, mode: "extra", prompt: "Treino extra 292", answer: "Ответ 292", xp: 7 },
    { id: 293, mode: "extra", prompt: "Treino extra 293", answer: "Ответ 293", xp: 8 },
    { id: 294, mode: "extra", prompt: "Treino extra 294", answer: "Ответ 294", xp: 9 },
    { id: 295, mode: "extra", prompt: "Treino extra 295", answer: "Ответ 295", xp: 10 },
    { id: 296, mode: "extra", prompt: "Treino extra 296", answer: "Ответ 296", xp: 11 },
    { id: 297, mode: "extra", prompt: "Treino extra 297", answer: "Ответ 297", xp: 12 },
    { id: 298, mode: "extra", prompt: "Treino extra 298", answer: "Ответ 298", xp: 13 },
    { id: 299, mode: "extra", prompt: "Treino extra 299", answer: "Ответ 299", xp: 14 },
    { id: 300, mode: "extra", prompt: "Treino extra 300", answer: "Ответ 300", xp: 5 },
    { id: 301, mode: "extra", prompt: "Treino extra 301", answer: "Ответ 301", xp: 6 },
    { id: 302, mode: "extra", prompt: "Treino extra 302", answer: "Ответ 302", xp: 7 },
    { id: 303, mode: "extra", prompt: "Treino extra 303", answer: "Ответ 303", xp: 8 },
    { id: 304, mode: "extra", prompt: "Treino extra 304", answer: "Ответ 304", xp: 9 },
    { id: 305, mode: "extra", prompt: "Treino extra 305", answer: "Ответ 305", xp: 10 },
    { id: 306, mode: "extra", prompt: "Treino extra 306", answer: "Ответ 306", xp: 11 },
    { id: 307, mode: "extra", prompt: "Treino extra 307", answer: "Ответ 307", xp: 12 },
    { id: 308, mode: "extra", prompt: "Treino extra 308", answer: "Ответ 308", xp: 13 },
    { id: 309, mode: "extra", prompt: "Treino extra 309", answer: "Ответ 309", xp: 14 },
    { id: 310, mode: "extra", prompt: "Treino extra 310", answer: "Ответ 310", xp: 5 },
    { id: 311, mode: "extra", prompt: "Treino extra 311", answer: "Ответ 311", xp: 6 },
    { id: 312, mode: "extra", prompt: "Treino extra 312", answer: "Ответ 312", xp: 7 },
    { id: 313, mode: "extra", prompt: "Treino extra 313", answer: "Ответ 313", xp: 8 },
    { id: 314, mode: "extra", prompt: "Treino extra 314", answer: "Ответ 314", xp: 9 },
    { id: 315, mode: "extra", prompt: "Treino extra 315", answer: "Ответ 315", xp: 10 },
    { id: 316, mode: "extra", prompt: "Treino extra 316", answer: "Ответ 316", xp: 11 },
    { id: 317, mode: "extra", prompt: "Treino extra 317", answer: "Ответ 317", xp: 12 },
    { id: 318, mode: "extra", prompt: "Treino extra 318", answer: "Ответ 318", xp: 13 },
    { id: 319, mode: "extra", prompt: "Treino extra 319", answer: "Ответ 319", xp: 14 },
    { id: 320, mode: "extra", prompt: "Treino extra 320", answer: "Ответ 320", xp: 5 },
    { id: 321, mode: "extra", prompt: "Treino extra 321", answer: "Ответ 321", xp: 6 },
    { id: 322, mode: "extra", prompt: "Treino extra 322", answer: "Ответ 322", xp: 7 },
    { id: 323, mode: "extra", prompt: "Treino extra 323", answer: "Ответ 323", xp: 8 },
    { id: 324, mode: "extra", prompt: "Treino extra 324", answer: "Ответ 324", xp: 9 },
    { id: 325, mode: "extra", prompt: "Treino extra 325", answer: "Ответ 325", xp: 10 },
    { id: 326, mode: "extra", prompt: "Treino extra 326", answer: "Ответ 326", xp: 11 },
    { id: 327, mode: "extra", prompt: "Treino extra 327", answer: "Ответ 327", xp: 12 },
    { id: 328, mode: "extra", prompt: "Treino extra 328", answer: "Ответ 328", xp: 13 },
    { id: 329, mode: "extra", prompt: "Treino extra 329", answer: "Ответ 329", xp: 14 },
    { id: 330, mode: "extra", prompt: "Treino extra 330", answer: "Ответ 330", xp: 5 },
    { id: 331, mode: "extra", prompt: "Treino extra 331", answer: "Ответ 331", xp: 6 },
    { id: 332, mode: "extra", prompt: "Treino extra 332", answer: "Ответ 332", xp: 7 },
    { id: 333, mode: "extra", prompt: "Treino extra 333", answer: "Ответ 333", xp: 8 },
    { id: 334, mode: "extra", prompt: "Treino extra 334", answer: "Ответ 334", xp: 9 },
    { id: 335, mode: "extra", prompt: "Treino extra 335", answer: "Ответ 335", xp: 10 },
    { id: 336, mode: "extra", prompt: "Treino extra 336", answer: "Ответ 336", xp: 11 },
    { id: 337, mode: "extra", prompt: "Treino extra 337", answer: "Ответ 337", xp: 12 },
    { id: 338, mode: "extra", prompt: "Treino extra 338", answer: "Ответ 338", xp: 13 },
    { id: 339, mode: "extra", prompt: "Treino extra 339", answer: "Ответ 339", xp: 14 },
    { id: 340, mode: "extra", prompt: "Treino extra 340", answer: "Ответ 340", xp: 5 },
    { id: 341, mode: "extra", prompt: "Treino extra 341", answer: "Ответ 341", xp: 6 },
    { id: 342, mode: "extra", prompt: "Treino extra 342", answer: "Ответ 342", xp: 7 },
    { id: 343, mode: "extra", prompt: "Treino extra 343", answer: "Ответ 343", xp: 8 },
    { id: 344, mode: "extra", prompt: "Treino extra 344", answer: "Ответ 344", xp: 9 },
    { id: 345, mode: "extra", prompt: "Treino extra 345", answer: "Ответ 345", xp: 10 },
    { id: 346, mode: "extra", prompt: "Treino extra 346", answer: "Ответ 346", xp: 11 },
    { id: 347, mode: "extra", prompt: "Treino extra 347", answer: "Ответ 347", xp: 12 },
    { id: 348, mode: "extra", prompt: "Treino extra 348", answer: "Ответ 348", xp: 13 },
    { id: 349, mode: "extra", prompt: "Treino extra 349", answer: "Ответ 349", xp: 14 },
    { id: 350, mode: "extra", prompt: "Treino extra 350", answer: "Ответ 350", xp: 5 },
    { id: 351, mode: "extra", prompt: "Treino extra 351", answer: "Ответ 351", xp: 6 },
    { id: 352, mode: "extra", prompt: "Treino extra 352", answer: "Ответ 352", xp: 7 },
    { id: 353, mode: "extra", prompt: "Treino extra 353", answer: "Ответ 353", xp: 8 },
    { id: 354, mode: "extra", prompt: "Treino extra 354", answer: "Ответ 354", xp: 9 },
    { id: 355, mode: "extra", prompt: "Treino extra 355", answer: "Ответ 355", xp: 10 },
    { id: 356, mode: "extra", prompt: "Treino extra 356", answer: "Ответ 356", xp: 11 },
    { id: 357, mode: "extra", prompt: "Treino extra 357", answer: "Ответ 357", xp: 12 },
    { id: 358, mode: "extra", prompt: "Treino extra 358", answer: "Ответ 358", xp: 13 },
    { id: 359, mode: "extra", prompt: "Treino extra 359", answer: "Ответ 359", xp: 14 },
    { id: 360, mode: "extra", prompt: "Treino extra 360", answer: "Ответ 360", xp: 5 },
    { id: 361, mode: "extra", prompt: "Treino extra 361", answer: "Ответ 361", xp: 6 },
    { id: 362, mode: "extra", prompt: "Treino extra 362", answer: "Ответ 362", xp: 7 },
    { id: 363, mode: "extra", prompt: "Treino extra 363", answer: "Ответ 363", xp: 8 },
    { id: 364, mode: "extra", prompt: "Treino extra 364", answer: "Ответ 364", xp: 9 },
    { id: 365, mode: "extra", prompt: "Treino extra 365", answer: "Ответ 365", xp: 10 },
    { id: 366, mode: "extra", prompt: "Treino extra 366", answer: "Ответ 366", xp: 11 },
    { id: 367, mode: "extra", prompt: "Treino extra 367", answer: "Ответ 367", xp: 12 },
    { id: 368, mode: "extra", prompt: "Treino extra 368", answer: "Ответ 368", xp: 13 },
    { id: 369, mode: "extra", prompt: "Treino extra 369", answer: "Ответ 369", xp: 14 },
    { id: 370, mode: "extra", prompt: "Treino extra 370", answer: "Ответ 370", xp: 5 },
    { id: 371, mode: "extra", prompt: "Treino extra 371", answer: "Ответ 371", xp: 6 },
    { id: 372, mode: "extra", prompt: "Treino extra 372", answer: "Ответ 372", xp: 7 },
    { id: 373, mode: "extra", prompt: "Treino extra 373", answer: "Ответ 373", xp: 8 },
    { id: 374, mode: "extra", prompt: "Treino extra 374", answer: "Ответ 374", xp: 9 },
    { id: 375, mode: "extra", prompt: "Treino extra 375", answer: "Ответ 375", xp: 10 },
    { id: 376, mode: "extra", prompt: "Treino extra 376", answer: "Ответ 376", xp: 11 },
    { id: 377, mode: "extra", prompt: "Treino extra 377", answer: "Ответ 377", xp: 12 },
    { id: 378, mode: "extra", prompt: "Treino extra 378", answer: "Ответ 378", xp: 13 },
    { id: 379, mode: "extra", prompt: "Treino extra 379", answer: "Ответ 379", xp: 14 },
    { id: 380, mode: "extra", prompt: "Treino extra 380", answer: "Ответ 380", xp: 5 },
    { id: 381, mode: "extra", prompt: "Treino extra 381", answer: "Ответ 381", xp: 6 },
    { id: 382, mode: "extra", prompt: "Treino extra 382", answer: "Ответ 382", xp: 7 },
    { id: 383, mode: "extra", prompt: "Treino extra 383", answer: "Ответ 383", xp: 8 },
    { id: 384, mode: "extra", prompt: "Treino extra 384", answer: "Ответ 384", xp: 9 },
    { id: 385, mode: "extra", prompt: "Treino extra 385", answer: "Ответ 385", xp: 10 },
    { id: 386, mode: "extra", prompt: "Treino extra 386", answer: "Ответ 386", xp: 11 },
    { id: 387, mode: "extra", prompt: "Treino extra 387", answer: "Ответ 387", xp: 12 },
    { id: 388, mode: "extra", prompt: "Treino extra 388", answer: "Ответ 388", xp: 13 },
    { id: 389, mode: "extra", prompt: "Treino extra 389", answer: "Ответ 389", xp: 14 },
    { id: 390, mode: "extra", prompt: "Treino extra 390", answer: "Ответ 390", xp: 5 },
    { id: 391, mode: "extra", prompt: "Treino extra 391", answer: "Ответ 391", xp: 6 },
    { id: 392, mode: "extra", prompt: "Treino extra 392", answer: "Ответ 392", xp: 7 },
    { id: 393, mode: "extra", prompt: "Treino extra 393", answer: "Ответ 393", xp: 8 },
    { id: 394, mode: "extra", prompt: "Treino extra 394", answer: "Ответ 394", xp: 9 },
    { id: 395, mode: "extra", prompt: "Treino extra 395", answer: "Ответ 395", xp: 10 },
    { id: 396, mode: "extra", prompt: "Treino extra 396", answer: "Ответ 396", xp: 11 },
    { id: 397, mode: "extra", prompt: "Treino extra 397", answer: "Ответ 397", xp: 12 },
    { id: 398, mode: "extra", prompt: "Treino extra 398", answer: "Ответ 398", xp: 13 },
    { id: 399, mode: "extra", prompt: "Treino extra 399", answer: "Ответ 399", xp: 14 },
    { id: 400, mode: "extra", prompt: "Treino extra 400", answer: "Ответ 400", xp: 5 },
];
function validateExtraField1(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField2(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField3(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField4(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField5(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField6(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField7(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField8(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField9(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField10(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField11(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField12(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField13(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField14(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField15(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField16(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField17(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField18(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField19(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField20(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField21(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField22(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField23(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField24(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField25(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField26(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField27(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField28(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField29(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField30(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField31(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField32(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField33(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField34(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField35(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField36(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField37(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField38(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField39(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField40(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField41(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField42(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField43(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField44(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField45(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField46(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField47(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField48(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField49(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField50(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField51(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField52(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField53(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField54(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField55(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField56(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField57(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField58(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField59(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField60(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField61(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField62(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField63(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField64(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField65(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField66(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField67(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField68(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField69(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField70(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField71(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField72(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField73(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField74(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField75(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField76(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField77(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField78(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField79(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField80(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField81(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField82(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField83(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField84(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField85(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField86(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField87(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField88(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField89(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField90(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField91(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField92(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField93(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField94(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField95(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField96(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField97(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField98(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField99(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField100(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField101(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField102(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField103(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField104(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField105(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField106(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField107(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField108(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField109(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField110(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField111(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField112(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField113(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField114(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField115(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField116(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField117(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField118(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField119(value) {
    return typeof value === "string" && value.trim().length > 0;
}
function validateExtraField120(value) {
    return typeof value === "string" && value.trim().length > 0;
}
