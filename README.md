# [Компилятор](https://gulgdev.github.io/chubrik-compiler/)

Компилирует ассемблер в коды сохранения для [компьютера Чубрика](https://github.com/chubrik/LogicArrows/blob/main/computer.md) в [Стрелочках](https://logic-arrows.io/).

## Принцип работы

В редакторе (левое окно) вы можете написать свой код. Выходные данные компилятора отобразятся в правом окне. При успешной компиляции там будет код, скопировав который вы можете перейти на карту и вставить дискету со скомпилированной программой. Если в коде есть ошибки, комплятор сообщит об этом и укажет конкретные места.

## Синтаксис

### Основы
Программа состоит из набора инструкций, меток и данных. Можно писать комментарии, используя точку с запятой (`;`):
```nasm
mov a, b ; Комментарий
loop:
  dec a
  jnz loop ; Цикл
```

### Инструкции
Вы можете посмотреть на все инструкции и их описания в [списке инструкций](/instructions.md).

### Данные
Вы можете хранить данные используя `db` (define byte, один или несколько байт хранятся в RAM и имя ссылается на адрес начала данных) и `equ` (equals, один байт существует только во время компиляции и имя ссылается на его значение):
```nasm
data db ; Данные хранятся в памяти компьютера
        0b1, ; bin
        02,  ; oct
        3,   ; dec
        0x2  ; hex

size equ $ - data ; Данные не хранятся в памяти комьютера, они существуют только во время компиляции
```

### Метки
Метки можно задавать, написав двоеточие после имени:
```nasm
label: ; "label" ссылается на адрес, на котором была объявлена метка
  ; ...

jmp label ; Компьютер перейдёт к выполнению инструкций, объявленных после объявления метки "label"
```
`$` обозначает текущий адрес. `label:` равносильно `label equ $`.

### Операции
Вы можете складывать и вычитать (вычисления происходят во время компиляции):
```nasm
one equ 1 ; "one" ссылается на число 1
two equ 2 ; "two" ссылается на число 2
three equ one + two ; "three" ссылается на число 3 (1 + 2)
```
Важно отметить, что в случае с данными, записанными в RAM операции будут производиться с адресами, а не со значениями:
```nasm
byte db 1 ; "byte" ссылается не на число 1, а на адрес
sum equ byte + 1 ; Не всегда равно 2, т.к. адрес "byte" зависит от места его объявления!
```
