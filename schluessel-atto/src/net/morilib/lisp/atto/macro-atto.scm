;;;
;;; Copyright 2009-2014 Yuichiro Moriguchi
;;; 
;;; Licensed under the Apache License, Version 2.0 (the "License");
;;; you may not use this file except in compliance with the License.
;;; You may obtain a copy of the License at
;;; 
;;;     http://www.apache.org/licenses/LICENSE-2.0
;;; 
;;; Unless required by applicable law or agreed to in writing, software
;;; distributed under the License is distributed on an "AS IS" BASIS,
;;; WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
;;; See the License for the specific language governing permissions and
;;; limitations under the License.

(define macroenv '(()))
(define pattern-id 0)
(define consf (lambda (x y) (if x (if y (cons x y) '()) #f)))
(define cdrf (lambda (x) (if x (cdr x) #f)))
(define ap2 (lambda (x y)
  (if (if x y #f)
      (if (null? x)
          y
          (cons (car x) (ap2 (cdr x) y)))
      #f)))
(define pair? (lambda (x) (if (null? x) #f (if (atom? x) #f #t))))

(define gen-sym-id 0)
(define gen-sym (lambda ()
  (set! gen-sym-id (1+ gen-sym-id))
  (string->symbol (string-append "#" gen-sym-id))))

(define gen-sym? (lambda (x)
  (if (symbol? x)
      (eqv? (string-ref (symbol->string x) 0) #\#)
      #f)))

(define memq (lambda (o l)
  (if (null? l)
      #f
      (if (eq? o (car l))
          l
          (memq o (cdr l))))))

(define assq (lambda (x lis)
  (if (null? lis)
      #f
      (if (eq? (car (car lis)) x)
          (car lis)
          (assq x (cdr lis))))))

(define symbol-scoped? (lambda (x)
  (if (symbol? x)
      ((lambda (s)
         (if (> (string-length s) 1)
             (eqv? (string-ref s 0) #\:)
             #f)
       ) (symbol->string x))
      #f)))

(define add-scope (lambda (x)
  (if (if (symbol? x) (if (gen-sym? x) #t (symbol-scoped? x)) #t)
      x
      (string->symbol (string-append ":"
                                     pattern-id
                                     "#"
                                     (symbol->string x))))))

(define remove-scope-string (lambda (x k)
  (if (eqv? (string-ref x k) #\#)
      (substring x (1+ k) (string-length x))
      (remove-scope-string x (1+ k)))))

(define remove-scope (lambda (x)
  (if (if (gen-sym? x) #f (symbol-scoped? x))
      (string->symbol (remove-scope-string (symbol->string x) 0))
      x)))

(define remove-all-scope (lambda (x)
  (if (null? x)
      x
      (if (pair? x)
          (cons (remove-all-scope (car x)) (remove-all-scope (cdr x)))
          (remove-scope x)))))

(define compile-macro (lambda (x)
  (if (null? x)
      '()
      (if (pair? x)
          (if (eq? '... (car x))
              (error "ellipse")
              (if (pair? (cdr x))
                  (if (eq? '... (car (cdr x)))
                      (cons (cons '... (compile-macro (car x)))
                            (compile-macro (cdr (cdr x))))
                      (cons (compile-macro (car x)) (compile-macro (cdr x))))
                  (cons (compile-macro (car x)) (compile-macro (cdr x)))))
          x))))

(define match-pattern-ellipse-vec (lambda (x y k l res)
  (if (eqv? k l)
      '()
      (consf (match-pattern x (vector-ref y k) res)
             (match-pattern-ellipse-vec x y (1+ k) l res)))))

(define vec-ellipse? (lambda (x k l)
  (if (< k (1- l)) (eq? (vector-ref x (1+ k)) '...) #f)))

(define match-pattern-vec (lambda (x y k l res)
  (if (eqv? k l)
      '()
      (if (vec-ellipse? x k l)
          (cons (match-pattern-ellipse-vec (vector-ref x k) y k l res) '())
          (ap2 (match-pattern (vector-ref x k) (vector-ref y k) res)
               (match-pattern-vec x y (1+ k) l res))))))

(define match-pattern-ellipse (lambda (x y res)
  (if (null? y)
      '()
      (consf (match-pattern x (car y) res)
             (match-pattern-ellipse x (cdr y) res)))))

(define match-pattern (lambda (x y res)
  (if (null? x)
      (if (null? y) '() #f)
      (if (pair? x)
          (if (if (pair? (car x)) (eq? (car (car x)) '...) #f)
              (if (pair? y)
                  (cons (match-pattern-ellipse (cdr (car x)) y res) '())
                  (if (null? y) '() #f))
              (if (pair? y)
                  (ap2 (match-pattern (car x) (car y) res)
                       (match-pattern (cdr x) (cdr y) res))
                  #f))
          (if (if (vector? x) (vector? y) #f)
              (match-pattern-vec x y 0 (vector-length y) res)
              (if (string? x)
                  (if (if (string? y) (eqv? x y) #f) '() #f)
                  (if (if (symbol? x) (memq x res) #t)
                      (if (eqv? x (remove-scope y)) '() #f)
                      (cons (cons x y) '()))))))))

(define extract-idx2 (lambda (k e)
  (if (null? e)
      '()
      (if (eqv? k 0)
          (car e)
          (extract-idx2 (1- k) (cdr e))))))

(define assoc-any? (lambda (s a)
  (if (null? s)
      #f
      (if (assq (car s) a) #t (assoc-any? (cdr s) a)))))

(define next-idx? (lambda (x s)
  (if (symbol? x)
      #f
      (if (pair? (car x))
          (if (assoc-any? s x) #t (pair? (car (car x))))
          (null? (car x))))))

(define extract-idx (lambda (m e s)
  (if (null? e)
      '()
      (if (null? (car e))
          (extract-idx m (cdr e) s)
          (if (next-idx? (car (car e)) s)
              (ap2 (extract-idx2 m (car e)) (extract-idx m (cdr e) s))
              (extract-idx m (cdr e) s))))))

(define extract-symbols-vec (lambda (x k l)
  (if (eqv? k l)
      '()
      (ap2 (extract-symbols (vector-ref x k))
           (extract-symbols-vec x (1+ k) l)))))

(define extract-symbols (lambda (x)
  (if (null? x)
      '()
      (if (pair? x)
          (ap2 (extract-symbols (car x)) (extract-symbols (cdr x)))
          (if (vector? x)
              (extract-symbols-vec x 0 (vector-length x))
              (if (symbol? x) (cons x '()) '()))))))

(define replace-pattern-ellipse1 (lambda (x e k s)
  ((lambda (v)
     (if (null? v)
         '()
         (cons (replace-pattern1 x v)
               (replace-pattern-ellipse1 x e (1+ k) s)))
   ) (extract-idx k e s))))

(define replace-pattern-ellipse (lambda (x e k)
  (replace-pattern-ellipse1 x e k (extract-symbols x))))

(define replace-pattern-ellipse-length1 (lambda (e k s)
  ((lambda (v)
     (if (null? v) k (replace-pattern-ellipse-length1 e (1+ k) s))
   ) (extract-idx k e s))))

(define replace-pattern-ellipse-length (lambda (x e k)
  (replace-pattern-ellipse-length1 e k (extract-symbols x))))

(define replace-pattern-vec-length (lambda (x k l e)
  (if (eqv? k l)
      k
      (if (vec-ellipse? x k l)
          (replace-pattern-ellipse-length x e k)
          (replace-pattern-vec-length x (1+ k) l e)))))

(define replace-pattern-ellipse-vec1 (lambda (x e k s z)
  ((lambda (v)
     (if (null? v)
         z
         (begin
           (vector-set! z k (replace-pattern1 x v))
           (replace-pattern-ellipse-vec1 x e (1+ k) s z)))
   ) (extract-idx k e s))))

(define replace-pattern-ellipse-vec (lambda (x e k v)
  (replace-pattern-ellipse-vec1 x e k (extract-symbols x) v)))

(define replace-pattern-vec1 (lambda (x k l e v)
  (if (eqv? k l)
      v
      (if (vec-ellipse? x k l)
          (replace-pattern-ellipse-vec (vector-ref x k) e k v)
          (begin
            (vector-set! v k (replace-pattern1 (vector-ref x k) e))
            (replace-pattern-vec1 x (1+ k) l e v))))))

(define replace-pattern-vec (lambda (x e)
  (define l (replace-pattern-vec-length x 0 (vector-length x) e))
  (replace-pattern-vec1 x 0 l e (make-vector l))))

(define replace-pattern1 (lambda (x e)
  (if (null? x)
      '()
      (if (pair? x)
          (if (if (pair? (car x)) (eq? (car (car x)) '...) #f)
              (ap2 (replace-pattern-ellipse (cdr (car x)) e 0)
                   (replace-pattern1 (cdr x) e))
              (cons (replace-pattern1 (car x) e)
                    (replace-pattern1 (cdr x) e)))
          (if (vector? x)
              (replace-pattern-vec x e)
              (if (assq x e)
                  (cdr (assq x e))
                  (add-scope x)))))))

(define replace-pattern (lambda (x e)
  (set! pattern-id (1+ pattern-id))
  (replace-pattern1 x e)))

(define add-local-env-lambda (lambda (x e)
  (if (null? x)
      e
      (cons (cons (car x) (gen-sym))
            (add-local-env-lambda (cdr x) e)))))

(define add-local-env-letrec (lambda (x e)
  (if (null? x)
      e
      (cons (cons (car (car x)) (gen-sym))
            (add-local-env-letrec (cdr x) e)))))

(define replace-local-lambda (lambda (x e)
  (replace-local-vals x (add-local-env-lambda (car x) e))))

(define replace-local-letrec (lambda (x e)
  (replace-local-vals x (add-local-env-letrec (car x) e))))

(define replace-local-inst (lambda (x e)
  (if (if (eq? 'lambda (remove-scope (car x))) (if (null? (cdr x)) #f #t) #f)
      (cons 'lambda (replace-local-lambda (cdr x) e))
      (if (eq? 'letrec (remove-scope (car x)))
          (cons 'letrec (replace-local-letrec (cdr x) e))
          (cons (replace-local-vals (car x) e)
                (replace-local-vals (cdr x) e))))))

(define replace-local-vals (lambda (x e)
  (if (null? x)
      '()
      (if (assq x e)
          (cdr (assq x e))
          (if (pair? x)
              (replace-local-inst x e)
              x)))))

(define extract-level (lambda (x k e)
  (if (null? x)
      '()
      (if (pair? x)
          (if (eq? (car x) '...)
              (extract-level (cdr x) (1+ k) e)
              (ap2 (extract-level (car x) k e) (extract-level (cdr x) k e)))
          (if (symbol? x)
              (cons (cons x k) '())
              '())))))

(define eqv-assoc? (lambda (x f)
  (if (assq (car x) f)
      (eqv? (cdr (assq (car x) f)) (cdr x))
      #t)))

(define check-level-num? (lambda (e f)
  (if (null? e)
      #t
      (if (eqv-assoc? (car e) f)
          (check-level-num? (cdr e) f)
          #f))))

(define check-level? (lambda (x y)
  (check-level-num? (extract-level x 0 '()) (extract-level y 0 '()))))

(define check-level-and-cons (lambda (x y)
  (if (check-level? x y)
      (cons x y)
      (error "level"))))

(define eval-syntax-rules1 (lambda (x)
  (if (null? (cdr (cdr x)))
      #t
      (error "syntax-rules"))
  (check-level-and-cons (compile-macro (car x))
                        (compile-macro (car (cdr x))))))

(define eval-syntax-rules-list (lambda (x)
  (if (null? x)
      '()
      (cons (eval-syntax-rules1 (car x))
            (eval-syntax-rules-list (cdr x))))))

(define eval-syntax-rules (lambda (x)
  (cons (car x) (eval-syntax-rules-list (cdr x)))))

(define eval-syntax-spec (lambda (x)
  (if (eq? 'syntax-rules (car x))
      (eval-syntax-rules (cdr x))
      (error "error"))))

(define find-env (lambda (x e)
  (if (null? e)
      #f
      (if (assq x (car e))
          (assq x (car e))
          (find-env x (cdr e))))))

(define cons-env (lambda (a e) (cons a e)))

(define eval-replace-list (lambda (x s l)
  (if (null? l)
      (error "malformed")
      ((lambda (v)
         (if v
             (replace-local-vals (replace-pattern (cdr (car l)) v) '())
             (eval-replace-list x s (cdr l)))
       ) (match-pattern (car (car l)) x s)))))

(define eval-replace1 (lambda (x e)
  ((lambda (v)
     (if v
         (cons (eval-replace-list x (car (car v)) (cdr (car v)))
               (cdr v))
         #f)
   ) (cdrf (find-env (remove-scope (car x)) e)))))

(define eval-replace (lambda (x e)
  (if (pair? x)
      ((lambda (v)
         (if v
             (eval-macro1 (car v) (cdr v))
             x)
       ) (eval-replace1 x e))
      x)))

(define eval-define-syntax! (lambda (x e)
  ((lambda (v)
    (if v
        (set-cdr! v (cons (eval-syntax-spec (car (cdr x))) e))
        (set-car! e (cons (cons (car x)
                                (cons (eval-syntax-spec (car (cdr x))) e))
                          (car e))))
   ) (find-env (car x) e))))

(define eval-let-syntax (lambda (x e)
  (if (null? x)
      '()
      (cons (cons (car (car x))
                  (cons (eval-syntax-spec (car (cdr (car x)))) e))
            (eval-let-syntax (cdr x) e)))))

(define eval-letrec-syntax! (lambda (x e)
  (if (null? x)
      e
      (begin
        (set-car! e (cons (cons (car (car x))
                                (cons (eval-syntax-spec (car (cdr (car x)))) e))
                          (car e)))
        (eval-letrec-syntax! (cdr x) e)))))

(define eval-macro1 (lambda (x e)
  ((lambda (v)
     (if (pair? v)
         (if (eq? 'define-syntax (car v))
             (eval-define-syntax! (cdr v) e)
             (if (eq? 'let-syntax (car v))
                 (cons 'begin
                       (eval-macro1 (cdr (cdr v))
                                    (cons-env (eval-let-syntax (car (cdr v)) e) e)))
                 (if (eq? 'letrec-syntax (car v))
                     (cons 'begin
                           (eval-macro1 (cdr (cdr v))
                                        (eval-letrec-syntax! (car (cdr v))
                                                             (cons-env '() e))))
                     (cons (eval-macro1 (car v) e) (eval-macro1 (cdr v) e)))))
         v)
   ) (eval-replace x e))))

(define eval-macro (lambda (x) (remove-all-scope (eval-macro1 x macroenv))))
