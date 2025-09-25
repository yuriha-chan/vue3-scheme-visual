(module
  ;; Reserve some memory (10 page = 640KiB)
  (memory 10)
  (export "memory" (memory 0))
  (func $malloc (param $size i32) (result i32)
    (local $addr i32)
    (local.set $addr (global.get $heap_ptr))
    (global.set $heap_ptr
               (i32.add (local.get $size) (global.get $heap_ptr)))
    (local.get $addr)
  )

  ;; Define a global heap pointer for malloc
  (global $heap_ptr (mut i32) (i32.const 65536)) ;; Start heap after 64kB

  ;; Function to create a new node
  (func $cons (param $car i32) (param $cdr i32) (result i32)
    (local $new i32)
    (local.set $new (call $malloc (i32.const 8)))
    ;; Store the value at the node's address
    (i32.store (local.get $new) (local.get $car))
    (i32.store (i32.add (local.get $new) (i32.const 4)) (local.get $cdr))

    (i32.or (local.get $new) (i32.const 0x10000000))
  )

  (func $vector (param $length i32) (result i32)
    (local $new i32)
    (local.set $new (call $malloc (i32.add (local.get $length) (i32.const 1))))
    (i32.store (local.get $new) (local.get $length))
    (i32.or (local.get $new) (i32.const 0x20000000))
  )

  (func $car (param $cell i32) (result i32)
    (i32.eq (i32.and (i32.const 0xf0000000) (local.get $cell)) (i32.const 0x10000000))
    (if (result i32)
      (then
        (i32.load (i32.and (i32.const 0x0fffffff) (local.get $cell))))
      (else
        (i32.const 0xef000000))))
  (func $carcps (param $cell i32) (param $cont func)
  (func $cdr (param $cell i32) (result i32)
    (i32.eq (i32.and (i32.const 0xf0000000) (local.get $cell)) (i32.const 0x10000000))
    (if (result i32)
      (then
        (i32.load (i32.add (i32.const 4) (i32.and (i32.const 0x0fffffff) (local.get $cell)))))
      (else
        (i32.const 0xef000000))))

  (func $nth (param $cell i32) (param $index i32) (result i32)
    (local $count i32)
    (block $exit (result i32)
      (loop $loop
        (i32.eq (local.get $count) (local.get $index))
        (if
          (then (call $car (local.get $cell)) (br $exit)))
        (local.set $cell
          (call $cdr (local.get $cell)))
        (local.set $count
          (i32.add (local.get $count) (i32.const 1)))
        (i32.eq
          (i32.and (local.get $cell) (i32.const 0xf0000000))
          (i32.const 0x10000000))
        br_if $loop
      )
      (i32.const 0xef000000)
    )
  )

  ;; Export the functions to JavaScript
  (export "cons" (func $cons))
  (export "car" (func $car))
  (export "cdr" (func $cdr))
  (export "vector" (func $vector))
  (export "nth" (func $nth))
)
