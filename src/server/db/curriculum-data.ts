import { AcademicUnit } from '../utils/pdf-generator';

export interface CourseDefinition {
  courseCode: string;
  courseName: string;
  courseDesc: string;
  branchCode: string;
  branchName: string;
  units: AcademicUnit[];
  examQuestions: string[];
  labExperiments: string[];
  bookRefs: string[];
}

export const CORE_CURRICULUM: CourseDefinition[] = [
  // -------------------------------------------------------------
  // COMPUTER SCIENCE & INFORMATION TECHNOLOGY (CSE / IT)
  // -------------------------------------------------------------
  {
    courseCode: 'CS101',
    courseName: 'Programming for Problem Solving & Object-Oriented Principles',
    courseDesc: 'Computational logic, control structures, pointers, memory layout, classes, inheritance, polymorphism, and file handling.',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    units: [
      { unit: 'Unit 1', title: 'Imperative Foundations & Memory Layout', topics: 'Data representations, bitwise operators, execution models, control flow, functions, call stack, activation records' },
      { unit: 'Unit 2', title: 'Pointers & Dynamic Memory Management', topics: 'Pointer arithmetic, arrays, heap allocation (malloc/free/new/delete), memory leak prevention, dangling pointer mitigation' },
      { unit: 'Unit 3', title: 'Object-Oriented Architecture', topics: 'Encapsulation, abstraction, constructor/destructor chains, operator overloading, deep vs shallow copying' },
      { unit: 'Unit 4', title: 'Inheritance & Dynamic Polymorphism', topics: 'Single and multiple inheritance, virtual function tables (vtable), abstract base classes, runtime type identification' },
      { unit: 'Unit 5', title: 'Templates, Generic Programming & STL', topics: 'Function and class templates, Standard Template Library (vector, map, set), custom iterators, exception handling' },
    ],
    examQuestions: [
      '1. Illustrate virtual table (vtable) and vptr mechanics during dynamic method dispatch in C++ with memory diagrams.',
      '2. Differentiate stack vs heap allocation, explaining memory fragmentation and RAII principles.',
      '3. Formulate a generic template class for a thread-safe circular buffer with boundary condition handling.',
    ],
    labExperiments: [
      'Lab 1: Memory Layout and Pointer Arithmetic Analysis using GDB debugger',
      'Lab 2: Object-Oriented Banking Simulation with Polymorphic Transaction Processing',
      'Lab 3: Custom String Class Implementation with Rule of Five and Move Semantics',
      'Lab 4: Generic Dictionary Implementation using Hash Maps with Collision Resolution',
    ],
    bookRefs: [
      'Bjarne Stroustrup - The C++ Programming Language (Addison-Wesley 4th Ed)',
      'Robert Lafore - Object-Oriented Programming in C++ (Sams Publishing)',
    ],
  },
  {
    courseCode: 'CS201',
    courseName: 'Data Structures and Algorithmic Analysis',
    courseDesc: 'Linear data structures, trees, AVL/Red-Black trees, graph traversals, heap priorities, hashing, and sorting algorithms.',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    units: [
      { unit: 'Unit 1', title: 'Linear Structures & Computational Complexity', topics: 'Asymptotic notation (O, Omega, Theta), dynamic arrays, singly and doubly linked lists, amortized analysis' },
      { unit: 'Unit 2', title: 'Stacks, Queues & Recursion Mechanics', topics: 'Stack evaluation, infix-to-postfix conversion, circular queues, double-ended queues (deque), call stack unwind' },
      { unit: 'Unit 3', title: 'Hierarchical Trees & Balanced Search Trees', topics: 'Binary Search Trees (BST), AVL rotations, Red-Black tree properties, B-Trees and B+ Trees node splitting' },
      { unit: 'Unit 4', title: 'Priority Queues, Heaps & Hashing', topics: 'Binary min/max heaps, heap sort, hash functions, open addressing (linear, quadratic), chaining with linked lists' },
      { unit: 'Unit 5', title: 'Graph Traversal & Greedy Networks', topics: 'Adjacency list/matrix, Breadth-First Search (BFS), Depth-First Search (DFS), Dijkstra shortest path, Prim and Kruskal MST' },
    ],
    examQuestions: [
      '1. Prove the time complexity of QuickSort average-case O(n log n) versus worst-case O(n^2), explaining pivot selection mitigations.',
      '2. Construct an AVL tree by sequentially inserting elements [15, 20, 24, 10, 13, 7, 30, 36, 25], illustrating LL, RR, LR, and RL rotations.',
      '3. Apply Dijkstra Single Source Shortest Path algorithm on a directed weighted graph with 6 vertices, showing priority queue iterations.',
    ],
    labExperiments: [
      'Lab 1: Implementation of Singly, Doubly, and Circular Linked Lists with In-Place Reversal',
      'Lab 2: Arithmetic Expression Evaluator using Dual-Stack Infix to Postfix Algorithm',
      'Lab 3: AVL Tree Implementation with Automatic Height Balancing Rotations',
      'Lab 4: Dijkstra Shortest Path and Kruskal Minimum Spanning Tree Implementation',
    ],
    bookRefs: [
      'Thomas H. Cormen, Charles E. Leiserson - Introduction to Algorithms (MIT Press 3rd Ed)',
      'Mark Allen Weiss - Data Structures and Algorithm Analysis in C++ (Pearson 4th Ed)',
    ],
  },
  {
    courseCode: 'CS301',
    courseName: 'Operating Systems & System Programming',
    courseDesc: 'Kernel architectures, multi-threaded CPU scheduling, IPC, deadlock algorithms, virtual memory demand paging, and disk systems.',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    units: [
      { unit: 'Unit 1', title: 'Kernel Architecture & Process Scheduling', topics: 'Microkernel vs Monolithic, process states, PCB, context switching, CPU scheduling: FCFS, SJF, Priority, Round Robin, Multilevel Feedback' },
      { unit: 'Unit 2', title: 'Concurrency & Synchronization Primitives', topics: 'Critical section problem, Peterson algorithm, hardware test-and-set, semaphores, classic IPC (Producer-Consumer, Dining Philosophers)' },
      { unit: 'Unit 3', title: 'Deadlock Characterization & Prevention', topics: 'Necessary conditions, resource allocation graphs, Banker algorithm for safety and avoidance, detection and recovery' },
      { unit: 'Unit 4', title: 'Memory Hierarchies & Virtual Memory', topics: 'Address translation, paging, segmentation, TLB, demand paging, page replacement (FIFO, LRU, Optimal), thrashing mitigation' },
      { unit: 'Unit 5', title: 'Storage Subsystems & File Layouts', topics: 'Inode structures, contiguous/linked/indexed file allocation, free-space bitmaps, disk scheduling (SSTF, SCAN, C-SCAN)' },
    ],
    examQuestions: [
      '1. Derive the average turnaround and waiting times for Round Robin (quantum=4ms) on a given 5-process burst sequence.',
      '2. Prove how the Banker Algorithm guarantees deadlock avoidance by verifying safe state conditions on an allocation matrix.',
      '3. Calculate the Effective Memory Access Time (EMAT) given TLB hit ratio 95%, TLB lookup 10ns, and main memory access 100ns.',
    ],
    labExperiments: [
      'Lab 1: POSIX Process Creation (fork, exec, wait) and IPC via Named Pipes',
      'Lab 2: Multi-Threaded Producer-Consumer Implementation using POSIX Mutexes and Semaphores',
      'Lab 3: Banker Deadlock Avoidance and Safe Sequence Generator in C',
      'Lab 4: Simulation of Page Replacement Algorithms (FIFO, LRU, Optimal) under Workload Traces',
    ],
    bookRefs: [
      'Abraham Silberschatz, Peter B. Galvin - Operating System Concepts (Wiley 10th Ed)',
      'Andrew S. Tanenbaum - Modern Operating Systems (Pearson 4th Ed)',
    ],
  },
  {
    courseCode: 'CS302',
    courseName: 'Database Management Systems & Distributed Transactions',
    courseDesc: 'Relational algebra, SQL-99 standards, normalization theory (1NF-BCNF), ACID concurrency, 2PL, and B+ Tree indexing.',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    units: [
      { unit: 'Unit 1', title: 'Relational Formalisms & Schema Design', topics: 'Relational algebra operators, tuple relational calculus, ER-to-relational schema mapping, integrity constraints' },
      { unit: 'Unit 2', title: 'Structured Query Language (SQL)', topics: 'Complex joins, correlated subqueries, aggregate grouping, window functions, views, triggers, and stored procedures' },
      { unit: 'Unit 3', title: 'Functional Dependencies & Normalization', topics: 'Armstrong axioms, canonical cover, attribute closure, 1NF, 2NF, 3NF, BCNF, lossless join, dependency preservation' },
      { unit: 'Unit 4', title: 'Transaction ACID & Concurrency Control', topics: 'Serializability, conflict graph testing, Two-Phase Locking (2PL, Strict 2PL), timestamp ordering, deadlock detection' },
      { unit: 'Unit 5', title: 'Storage Engines, Indexing & Query Tuning', topics: 'B+ Tree index insertion and deletion, hash indexes, query execution trees, cost-based optimizer estimates' },
    ],
    examQuestions: [
      '1. Given relation R(A,B,C,D,E) and FDs {A->B, BC->D, D->E, E->A}, compute all candidate keys and decompose R into BCNF.',
      '2. Construct a precedence graph for a concurrent transaction schedule of 4 transactions to determine conflict serializability.',
      '3. Trace the node splitting operations of a B+ Tree of order 3 when inserting keys [10, 20, 30, 40, 50, 60, 70].',
    ],
    labExperiments: [
      'Lab 1: Enterprise Schema Definition with Strict Foreign Keys and Check Constraints in PostgreSQL',
      'Lab 2: Complex Analytical SQL Queries using Subqueries, Grouping Sets, and Window Functions',
      'Lab 3: Database Event Triggers and Stored Procedures for Automatic Audit Logging',
      'Lab 4: Concurrent Transaction Isolation Testing: Demonstrating Dirty Reads and Lost Updates',
    ],
    bookRefs: [
      'Raghu Ramakrishnan, Johannes Gehrke - Database Management Systems (McGraw-Hill 3rd Ed)',
      'Abraham Silberschatz, Henry F. Korth - Database System Concepts (McGraw-Hill 7th Ed)',
    ],
  },
  {
    courseCode: 'CS303',
    courseName: 'Computer Networks & Internet Protocols',
    courseDesc: 'OSI and TCP/IP protocol stacks, sliding window flow control, routing algorithms (Dijkstra, BGP), TCP congestion, and DNS/TLS.',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    units: [
      { unit: 'Unit 1', title: 'Physical & Data Link Protocol Foundations', topics: 'Transmission media, framing, error detection (CRC-32, Hamming code), sliding window flow control (Go-Back-N, Selective Repeat)' },
      { unit: 'Unit 2', title: 'Medium Access & Local Area Networks', topics: 'ALOHA, CSMA/CD (Ethernet), CSMA/CA (WiFi 802.11), VLANs, STP (Spanning Tree Protocol), ARP protocol' },
      { unit: 'Unit 3', title: 'Network Layer & Routing Protocols', topics: 'IPv4 and IPv6 addressing, CIDR subnetting, Distance Vector (Bellman-Ford), Link State (Dijkstra/OSPF), Border Gateway Protocol (BGP)' },
      { unit: 'Unit 4', title: 'Transport Layer & Congestion Control', topics: 'UDP datagrams, TCP 3-way handshake, connection teardown, TCP flow control, AIMD congestion control (Slow Start, Fast Retransmit)' },
      { unit: 'Unit 5', title: 'Application Layer Protocols & Network Security', topics: 'DNS resolution hierarchy, HTTP/1.1 vs HTTP/2 vs HTTP/3 (QUIC), SMTP, TLS/SSL handshake, firewalls and NAT' },
    ],
    examQuestions: [
      '1. Subnet an IP block 192.168.10.0/24 into 4 subnets with varying host allocations, stating network and broadcast addresses.',
      '2. Explain TCP Tahoe versus TCP Reno congestion avoidance, drawing the congestion window size over round-trip iterations.',
      '3. Calculate the CRC checksum for data frame 1101011011 using generator polynomial G(x) = x^4 + x + 1.',
    ],
    labExperiments: [
      'Lab 1: Packet Capture and Protocol Analysis of ARP, DNS, TCP Handshake using Wireshark',
      'Lab 2: Socket Programming in C/Python: Multi-Threaded Chat Server using TCP and UDP Sockets',
      'Lab 3: Network Topology Simulation and Routing Configuration using Cisco Packet Tracer',
      'Lab 4: Sliding Window Protocol Simulation (Go-Back-N and Selective Repeat) under Packet Loss',
    ],
    bookRefs: [
      'James F. Kurose, Keith W. Ross - Computer Networking: A Top-Down Approach (Pearson 8th Ed)',
      'Andrew S. Tanenbaum, David J. Wetherall - Computer Networks (Pearson 5th Ed)',
    ],
  },
  {
    courseCode: 'CS304',
    courseName: 'Design and Analysis of Algorithms',
    courseDesc: 'Divide and conquer, greedy algorithms, dynamic programming, network flow, NP-completeness, and approximation algorithms.',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    units: [
      { unit: 'Unit 1', title: 'Algorithmic Frameworks & Divide-and-Conquer', topics: 'Recurrence solving (Master Theorem, recursion tree), MergeSort, QuickSort, Strassen matrix multiplication' },
      { unit: 'Unit 2', title: 'Greedy Method & Optimal Substuctures', topics: 'Fractional knapsack, Huffman encoding tree, job sequencing with deadlines, optimal merge patterns' },
      { unit: 'Unit 3', title: 'Dynamic Programming', topics: '0/1 Knapsack, Longest Common Subsequence (LCS), Matrix Chain Multiplication, Floyd-Warshall all-pairs shortest paths' },
      { unit: 'Unit 4', title: 'Backtracking & Branch-and-Bound', topics: 'N-Queens problem, Subset Sum problem, Graph Coloring, Hamiltonian Cycle, 15-puzzle state space search' },
      { unit: 'Unit 5', title: 'Computational Complexity & NP-Theory', topics: 'P, NP, NP-Complete, NP-Hard classes, Cook-Levin theorem, reductions (3-SAT to Vertex Cover, Clique, Subset Sum)' },
    ],
    examQuestions: [
      '1. Solve the recurrence T(n) = 3T(n/2) + Theta(n^2) using Master Theorem and verify with recursion tree method.',
      '2. Compute the optimal parenthesization order for matrix chain multiplication of dimensions [10x30, 30x5, 5x60, 60x10].',
      '3. Formulate the dynamic programming recurrence for Longest Common Subsequence (LCS) and trace strings "ACCGGTC" and "GTCGTTC".',
    ],
    labExperiments: [
      'Lab 1: Comparative Empirical Timing Analysis of Divide-and-Conquer Sorting Algorithms',
      'Lab 2: Huffman Optimal Prefix Code Generator and Text Compressor Implementation',
      'Lab 3: Dynamic Programming: 0/1 Knapsack and Matrix Chain Multiplication',
      'Lab 4: N-Queens Problem Solver using Backtracking with State-Space Pruning',
    ],
    bookRefs: [
      'Thomas H. Cormen, Charles E. Leiserson - Introduction to Algorithms (MIT Press 3rd Ed)',
      'Ellis Horowitz, Sartaj Sahni - Fundamentals of Computer Algorithms (Galgotia)',
    ],
  },
  {
    courseCode: 'CS305',
    courseName: 'Theory of Computation and Automata',
    courseDesc: 'Deterministic and non-deterministic finite automata, regular languages, context-free grammars, pushdown automata, and Turing computability.',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    units: [
      { unit: 'Unit 1', title: 'Finite Automata & Regular Languages', topics: 'DFA, NFA, epsilon-NFA, subset construction algorithm, minimization of DFA (Myhill-Nerode theorem), regular expressions' },
      { unit: 'Unit 2', title: 'Regular Language Properties & Pumping Lemma', topics: 'Pumping lemma for regular languages, closure properties (union, intersection, complement), decision algorithms for regular sets' },
      { unit: 'Unit 3', title: 'Context-Free Grammars & Pushdown Automata', topics: 'Derivation trees, ambiguity, Chomsky Normal Form (CNF), Greibach Normal Form (GNF), PDA transition mechanics' },
      { unit: 'Unit 4', title: 'Context-Free Language Limits & Pumping Lemma', topics: 'Pumping lemma for CFLs, Ogden lemma, closure properties of CFLs, CYK parsing algorithm' },
      { unit: 'Unit 5', title: 'Turing Machines & Undecidability', topics: 'Standard Turing Machine model, multi-tape TMs, Church-Turing thesis, Universal Turing Machine, Halting problem, Post Correspondence' },
    ],
    examQuestions: [
      '1. Construct a minimal DFA accepting the set of binary strings where the count of 0s is divisible by 3 and contains substring 10.',
      '2. Using the Pumping Lemma for Regular Languages, prove that L = {0^n 1^n | n >= 0} is not regular.',
      '3. Prove that the Halting Problem for Turing Machines is undecidable using a diagonal argument.',
    ],
    labExperiments: [
      'Lab 1: Regular Expression Engine and Lexical Tokenizer Simulator in Python',
      'Lab 2: DFA Simulator and State Minimization Algorithm Implementation',
      'Lab 3: Pushdown Automaton Simulator for Palindrome and Balanced Bracket Recognition',
      'Lab 4: Single-Tape Turing Machine Simulator for Binary Addition and Multiplicative Unary',
    ],
    bookRefs: [
      'John E. Hopcroft, Rajeev Motwani - Introduction to Automata Theory, Languages, and Computation (Pearson)',
      'Michael Sipser - Introduction to the Theory of Computation (Cengage Learning 3rd Ed)',
    ],
  },
  {
    courseCode: 'CS401',
    courseName: 'Artificial Intelligence & Machine Learning',
    courseDesc: 'Heuristic search, game playing (Minimax, Alpha-Beta), supervised learning, neural networks, backpropagation, and transformer attention.',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    units: [
      { unit: 'Unit 1', title: 'Intelligent Agents & State-Space Search', topics: 'Agent environments, BFS/DFS, heuristic A* search, IDA*, iterative deepening, admissibility and consistency of heuristics' },
      { unit: 'Unit 2', title: 'Adversarial Search & Constraint Satisfaction', topics: 'Minimax game tree search, Alpha-Beta pruning, evaluation functions, Constraint Satisfaction Problems (CSP), forward checking' },
      { unit: 'Unit 3', title: 'Supervised Learning & Statistical Classification', topics: 'Linear regression, cost functions, gradient descent, logistic regression, decision trees (ID3, C4.5), Support Vector Machines (SVM)' },
      { unit: 'Unit 4', title: 'Artificial Neural Networks & Deep Architectures', topics: 'Perceptron, multi-layer perceptron, backpropagation derivation, activation functions (ReLU, Softmax), regularization (Dropout)' },
      { unit: 'Unit 5', title: 'Modern Deep Learning & Attention Mechanisms', topics: 'Convolutional Neural Networks (CNNs), Recurrent Neural Networks (RNNs, LSTMs), Scaled Dot-Product Attention, Transformers' },
    ],
    examQuestions: [
      '1. Trace A* search on a navigation state space graph and prove that A* is optimal whenever the heuristic function is consistent.',
      '2. Apply Alpha-Beta pruning on a 4-level game tree and indicate which branches are pruned during depth-first evaluation.',
      '3. Derive the mathematical weight update rule for a two-layer neural network using the backpropagation chain rule.',
    ],
    labExperiments: [
      'Lab 1: Implementation of A* Search for Solving 8-Puzzle Problem with Manhattan Distance Heuristic',
      'Lab 2: Minimax Algorithm with Alpha-Beta Pruning for Tic-Tac-Toe Game Engine',
      'Lab 3: Logistic Regression and Decision Tree Classifier Implementation from Scratch in Python',
      'Lab 4: Convolutional Neural Network (CNN) for Image Classification using PyTorch',
    ],
    bookRefs: [
      'Stuart Russell, Peter Norvig - Artificial Intelligence: A Modern Approach (Pearson 4th Ed)',
      'Ian Goodfellow, Yoshua Bengio - Deep Learning (MIT Press)',
    ],
  },
  {
    courseCode: 'CS402',
    courseName: 'Compiler Design & Program Analysis',
    courseDesc: 'Lexical analysis, top-down LL(1) and bottom-up LR parsers, syntax-directed translation, intermediate code generation, and optimization.',
    branchCode: 'CSE',
    branchName: 'Computer Science and Engineering',
    units: [
      { unit: 'Unit 1', title: 'Lexical Analysis & Automata Generation', topics: 'Role of lexical analyzer, tokens/patterns/lexemes, regular expressions to DFA (Thompsons construction), Flex tool architecture' },
      { unit: 'Unit 2', title: 'Syntax Analysis & Top-Down Parsing', topics: 'Context-free grammars, elimination of left recursion, left factoring, FIRST and FOLLOW sets, predictive LL(1) parse table construction' },
      { unit: 'Unit 3', title: 'Bottom-Up LR Parsing', topics: 'Shift-reduce parsing, handles, LR(0) items, SLR(1) parsing table, Canonical LR(1) and LALR(1) parsers, Yacc/Bison specifications' },
      { unit: 'Unit 4', title: 'Syntax-Directed Translation & Intermediate Code', topics: 'Syntax-Directed Definitions (SDD), synthesized and inherited attributes, Three-Address Code (TAC), quadruples, triples' },
      { unit: 'Unit 5', title: 'Code Optimization & Target Generation', topics: 'Basic blocks and flow graphs, local optimizations (constant folding, dead code elimination), loop optimizations, register allocation' },
    ],
    examQuestions: [
      '1. Compute the FIRST and FOLLOW sets for a given grammar and construct its predictive LL(1) parsing table.',
      '2. Construct the set of LR(0) items and the corresponding SLR(1) parse table for an expression grammar, checking for conflicts.',
      '3. Translate an arithmetic expression with nested boolean conditions into Three-Address Code (TAC) quadruples.',
    ],
    labExperiments: [
      'Lab 1: Lexical Analyzer Generation using Lex/Flex for C Token Recognition',
      'Lab 2: Recursive Descent Parser Implementation with Syntax Error Reporting',
      'Lab 3: LALR(1) Parser Generation using Yacc/Bison for Arithmetic Calculator',
      'Lab 4: Intermediate Code Generation: Synthesizing Three-Address Code from AST',
    ],
    bookRefs: [
      'Alfred V. Aho, Monica S. Lam, Ravi Sethi, Jeffrey D. Ullman - Compilers: Principles, Techniques, and Tools (Dragon Book 2nd Ed)',
    ],
  },

  // -------------------------------------------------------------
  // ELECTRONICS & COMMUNICATION ENGINEERING (ECE)
  // -------------------------------------------------------------
  {
    courseCode: 'EC201',
    courseName: 'Electronic Devices & Analog Circuits',
    courseDesc: 'Semiconductor physics, PN junction diodes, BJT and MOSFET small-signal models, operational amplifiers, and feedback topologies.',
    branchCode: 'ECE',
    branchName: 'Electronics and Communication Engineering',
    units: [
      { unit: 'Unit 1', title: 'Semiconductor Diodes & Applications', topics: 'Energy band theory, PN junction barrier potential, forward/reverse bias, Zener breakdown, half-wave/full-wave rectifiers, ripple factor' },
      { unit: 'Unit 2', title: 'Bipolar Junction Transistors (BJT)', topics: 'CB, CE, CC configurations, input/output characteristics, DC load line, Q-point stability, self-bias circuit analysis' },
      { unit: 'Unit 3', title: 'Field Effect Transistors (FET & MOSFET)', topics: 'JFET pinch-off voltage, Enhancement and Depletion MOSFETs, drain and transfer characteristics, CMOS logic inverter' },
      { unit: 'Unit 4', title: 'Small Signal Low Frequency Amplifiers', topics: 'h-parameter model of CE amplifier, voltage gain, current gain, input/output impedance, frequency response (Bode plot)' },
      { unit: 'Unit 5', title: 'Operational Amplifiers & Feedback Circuits', topics: 'Ideal op-amp characteristics, inverting/non-inverting amplifiers, integrator, differentiator, instrumentation amplifier' },
    ],
    examQuestions: [
      '1. Derive the stability factor S for a self-bias (voltage divider) BJT circuit and explain how it prevents thermal runaway.',
      '2. Draw the small-signal h-parameter equivalent circuit of a CE amplifier and derive equations for voltage gain and input impedance.',
      '3. Explain the operation of an inverting Operational Amplifier integrator and derive its output voltage transfer function.',
    ],
    labExperiments: [
      'Lab 1: V-I Characteristics of PN Junction Diode and Zener Voltage Regulation',
      'Lab 2: BJT Common Emitter (CE) Input and Output Characteristic Curves Determination',
      'Lab 3: Frequency Response Analysis of Single-Stage BJT RC-Coupled Amplifier',
      'Lab 4: Inverting, Non-Inverting, and Summing Operational Amplifier Circuit Verification',
    ],
    bookRefs: [
      'Jacob Millman, Christos C. Halkias - Integrated Electronics (McGraw-Hill)',
      'Adel S. Sedra, Kenneth C. Smith - Microelectronic Circuits (Oxford University Press 7th Ed)',
    ],
  },
  {
    courseCode: 'EC202',
    courseName: 'Signals and Systems',
    courseDesc: 'Continuous and discrete time signals, Linear Time-Invariant (LTI) convolution, Fourier series/transforms, Laplace and Z-transforms.',
    branchCode: 'ECE',
    branchName: 'Electronics and Communication Engineering',
    units: [
      { unit: 'Unit 1', title: 'Signal Classifications & System Properties', topics: 'Continuous vs discrete time, energy vs power signals, linearity, time-invariance, causality, stability (BIBO)' },
      { unit: 'Unit 2', title: 'LTI Systems & Convolution', topics: 'Convolution integral, convolution sum, impulse response, step response, cascade and parallel system interconnections' },
      { unit: 'Unit 3', title: 'Fourier Analysis of Continuous-Time Signals', topics: 'Continuous-Time Fourier Series (CTFS), Dirichlet conditions, Continuous-Time Fourier Transform (CTFT), duality, Parsevals theorem' },
      { unit: 'Unit 4', title: 'Laplace Transform & System Stability', topics: 'Region of Convergence (ROC) properties, unilateral and bilateral Laplace transforms, transfer functions, pole-zero plots' },
      { unit: 'Unit 5', title: 'Z-Transform & Discrete-Time Analysis', topics: 'Z-Transform definition, ROC properties, inverse Z-Transform (partial fractions, residue), stability and causality in Z-domain' },
    ],
    examQuestions: [
      '1. Convolve two continuous-time rectangular pulses x(t) = u(t) - u(t-2) and h(t) = u(t) - u(t-1) analytically.',
      '2. State and prove the Nyquist Sampling Theorem, explaining aliasing distortion and anti-aliasing filter requirements.',
      '3. Find the Laplace transform and ROC of signal x(t) = e^(-3t)u(t) + e^(-2t)u(-t).',
    ],
    labExperiments: [
      'Lab 1: Generation and Elementary Transformations of Continuous and Discrete Test Signals in Python',
      'Lab 2: Numerical Verification of Convolution Integral and Convolution Sum',
      'Lab 3: Fourier Spectrum Analysis of Periodic Square and Triangular Waveforms',
      'Lab 4: Pole-Zero Mapping and Impulse Response Verification of LTI Systems in Z-Domain',
    ],
    bookRefs: [
      'Alan V. Oppenheim, Alan S. Willsky - Signals and Systems (Pearson 2nd Ed)',
      'Simon Haykin, Barry Van Veen - Signals and Systems (Wiley 2nd Ed)',
    ],
  },
  {
    courseCode: 'EC301',
    courseName: 'Digital Signal Processing & Filter Design',
    courseDesc: 'Discrete Fourier Transform, Radix-2 FFT, infinite/finite impulse response filters (Butterworth, Chebyshev, FIR Windows), and realization.',
    branchCode: 'ECE',
    branchName: 'Electronics and Communication Engineering',
    units: [
      { unit: 'Unit 1', title: 'Discrete Fourier Transform & FFT', topics: 'DFT properties, circular convolution vs linear convolution, Decimation-In-Time (DIT) and Decimation-In-Frequency (DIF) Radix-2 FFT' },
      { unit: 'Unit 2', title: 'Infinite Impulse Response (IIR) Filter Design', topics: 'Analog Butterworth and Chebyshev filter approximations, Bilinear Transformation, Impulse Invariance, frequency warping' },
      { unit: 'Unit 3', title: 'Finite Impulse Response (FIR) Filter Design', topics: 'Linear phase conditions, symmetric/antisymmetric impulse responses, windowing methods (Rectangular, Hamming, Hanning, Blackman)' },
      { unit: 'Unit 4', title: 'Digital Filter Realization Structures', topics: 'Direct Form I, Direct Form II, Cascade, Parallel, and Lattice ladder realizations for IIR and FIR architectures' },
      { unit: 'Unit 5', title: 'Finite Word Length Effects in DSP', topics: 'Fixed vs floating-point representations, ADC quantization noise, coefficient round-off error, limit cycle oscillations' },
    ],
    examQuestions: [
      '1. Compute the 8-point DFT using Radix-2 DIT-FFT butterfly signal flow graph with twiddle factor computations.',
      '2. Design a digital low-pass Butterworth filter with passband edge 0.2*pi and stopband edge 0.3*pi using Bilinear Transformation.',
      '3. Formulate the filter coefficients of a 7-tap linear phase FIR band-pass filter using the Hamming window technique.',
    ],
    labExperiments: [
      'Lab 1: Computation of N-Point DFT and Verification of Circular Convolution in Python',
      'Lab 2: Implementation of Radix-2 DIT-FFT Butterfly Algorithm from Scratch',
      'Lab 3: Design and Magnitude Response Verification of IIR Low-Pass Butterworth Filter',
      'Lab 4: Design and Spectral Analysis of Linear Phase FIR Filter using Windowing Methods',
    ],
    bookRefs: [
      'John G. Proakis, Dimitris G. Manolakis - Digital Signal Processing: Principles, Algorithms, and Applications (Pearson 4th Ed)',
      'Alan V. Oppenheim, Ronald W. Schafer - Discrete-Time Signal Processing (Pearson 3rd Ed)',
    ],
  },
  {
    courseCode: 'EC305',
    courseName: 'Communication Systems & Modulation Protocols',
    courseDesc: 'Continuous wave modulation (AM, FM, PM), digital baseband transmission, pulse code modulation, digital modulation (QPSK, QAM), and noise.',
    branchCode: 'ECE',
    branchName: 'Electronics and Communication Engineering',
    units: [
      { unit: 'Unit 1', title: 'Amplitude Modulation & Detection', topics: 'Double Sideband Full Carrier (DSB-FC), DSB-SC, Single Sideband (SSB-SC), Vestigial Sideband (VSB), envelope detector, superheterodyne receiver' },
      { unit: 'Unit 2', title: 'Frequency & Phase Modulation', topics: 'Narrowband and wideband FM, Carsons bandwidth rule, indirect FM (Armstrong method), phase-locked loop (PLL) FM demodulation' },
      { unit: 'Unit 3', title: 'Pulse Modulation & Baseband Transmission', topics: 'Sampling theorem, PAM, PWM, PPM, Pulse Code Modulation (PCM), uniform and non-uniform quantization (A-law, mu-law), Delta Modulation' },
      { unit: 'Unit 4', title: 'Digital Bandpass Modulation Schemes', topics: 'Geometric signal representation, Binary Phase Shift Keying (BPSK), QPSK, M-ary QAM, constellation diagrams, matched filter detection' },
      { unit: 'Unit 5', title: 'Noise Analysis & Information Theory', topics: 'Thermal noise, SNR in AM/FM receivers, Shannon channel capacity theorem, entropy, source coding (Huffman, Shannon-Fano)' },
    ],
    examQuestions: [
      '1. Derive the power efficiency equation for conventional Amplitude Modulation (AM) and calculate efficiency for 100% modulation.',
      '2. State and prove Carsons rule for the transmission bandwidth of a frequency modulated (FM) wave with modulation index beta.',
      '3. Derive the bit error rate (BER) expression for Binary Phase Shift Keying (BPSK) over an Additive White Gaussian Noise (AWGN) channel.',
    ],
    labExperiments: [
      'Lab 1: Generation and Demodulation of Amplitude Modulated (AM) Waveform',
      'Lab 2: Frequency Modulation (FM) and Demodulation using Phase-Locked Loop (PLL)',
      'Lab 3: Pulse Code Modulation (PCM) and Demodulation with Quantization Noise Measurement',
      'Lab 4: Digital Modulation and Constellation Diagram Verification for BPSK and QPSK',
    ],
    bookRefs: [
      'Simon Haykin - Communication Systems (Wiley 4th Ed)',
      'B.P. Lathi, Zhi Ding - Modern Digital and Analog Communication Systems (Oxford University Press 4th Ed)',
    ],
  },

  // -------------------------------------------------------------
  // ELECTRICAL & ELECTRONICS ENGINEERING (EEE)
  // -------------------------------------------------------------
  {
    courseCode: 'EE201',
    courseName: 'Electric Circuit Analysis & Network Theorems',
    courseDesc: 'Mesh and nodal analysis, Thevenin/Norton/Superposition theorems, transient RLC response, sinusoidal steady-state, and two-port networks.',
    branchCode: 'EEE',
    branchName: 'Electrical and Electronics Engineering',
    units: [
      { unit: 'Unit 1', title: 'Circuit Topologies & Systematic Analysis', topics: 'KCL, KVL, graph theory (incidence, tie-set, cut-set matrices), nodal and mesh analysis with dependent sources, star-delta conversion' },
      { unit: 'Unit 2', title: 'Network Theorems in DC and AC', topics: 'Superposition theorem, Thevenin theorem, Norton theorem, Maximum Power Transfer theorem, Reciprocity and Millman theorems' },
      { unit: 'Unit 3', title: 'Transient Response of Dynamic Circuits', topics: 'First-order RL and RC circuits, step and impulse response, second-order RLC circuits, overdamped/critically damped/underdamped cases' },
      { unit: 'Unit 4', title: 'Sinusoidal Steady-State & Resonant Circuits', topics: 'Phasor concepts, impedance and admittance, series and parallel resonance, quality factor Q, bandwidth, 3-phase balanced/unbalanced' },
      { unit: 'Unit 5', title: 'Two-Port Network Parameters', topics: 'Impedance (Z), Admittance (Y), Hybrid (h), Transmission (ABCD) parameters, interrelationships, reciprocal and symmetrical conditions' },
    ],
    examQuestions: [
      '1. Find the Thevenin equivalent circuit across terminals A-B for a bridged-T network with dependent voltage sources.',
      '2. Derive the second-order differential equation and transient current response i(t) for a series RLC circuit excited by a DC step voltage.',
      '3. Formulate the ABCD transmission parameters for a symmetrical pi-network in terms of its branch impedances.',
    ],
    labExperiments: [
      'Lab 1: Verification of Thevenin, Norton, and Maximum Power Transfer Theorems on DC Test Circuits',
      'Lab 2: Transient Response Measurement of Series RL and RC Circuits using Digital Storage Oscilloscope',
      'Lab 3: Determination of Resonant Frequency, Bandwidth, and Quality Factor of Series and Parallel RLC Circuits',
      'Lab 4: Measurement and Verification of Z and Y Parameters for Two-Port Passive Networks',
    ],
    bookRefs: [
      'William H. Hayt, Jack E. Kemmerly - Engineering Circuit Analysis (McGraw-Hill 8th Ed)',
      'Charles K. Alexander, Matthew N.O. Sadiku - Fundamentals of Electric Circuits (McGraw-Hill 5th Ed)',
    ],
  },
  {
    courseCode: 'EE301',
    courseName: 'Power Systems Analysis & Grid Stability',
    courseDesc: 'Per-unit modeling, transmission parameters, Gauss-Seidel and Newton-Raphson power flow, symmetrical/unsymmetrical faults, and stability.',
    branchCode: 'EEE',
    branchName: 'Electrical and Electronics Engineering',
    units: [
      { unit: 'Unit 1', title: 'Power System Modeling & Per-Unit Systems', topics: 'Single-line diagrams, per-unit impedances, change of base, synchronous machine modeling, 3-winding transformer equivalents' },
      { unit: 'Unit 2', title: 'Transmission Line Parameters & Characteristics', topics: 'Inductance and capacitance of transposed lines, bundled conductors, short/medium/long line models (ABCD constants), Ferranti effect' },
      { unit: 'Unit 3', title: 'Power Flow Analysis (Load Flow)', topics: 'Bus classification (Slack, PV, PQ), bus admittance matrix (Ybus), Gauss-Seidel method, Newton-Raphson method (polar coordinates)' },
      { unit: 'Unit 4', title: 'Fault Analysis in Power Networks', topics: 'Symmetrical 3-phase faults, subtransient/transient reactances, symmetrical components (Fortescue), LG, LL, and LLG fault calculations' },
      { unit: 'Unit 5', title: 'Power System Stability & Equal Area Criterion', topics: 'Rotor dynamics, swing equation, power-angle curve, steady-state vs transient stability, Equal Area Criterion for fault clearance' },
    ],
    examQuestions: [
      '1. Develop the Jacobian matrix elements for a 3-bus power system using the Newton-Raphson load flow algorithm.',
      '2. Calculate subtransient fault current and bus voltages for a single line-to-ground (LG) fault on phase A through fault impedance Zf.',
      '3. Apply the Equal Area Criterion to find the critical clearing angle (delta_cr) for a synchronous generator connected to an infinite bus.',
    ],
    labExperiments: [
      'Lab 1: Formation of Bus Admittance Matrix (Ybus) and Bus Impedance Matrix (Zbus) for a 5-Bus Power System',
      'Lab 2: Newton-Raphson Load Flow Analysis and Voltage Profile Determination using MATLAB/Python',
      'Lab 3: Symmetrical and Unsymmetrical Fault Analysis on a Transmission Line Network',
      'Lab 4: Transient Stability Simulation and Critical Clearing Time Determination using Swing Equation',
    ],
    bookRefs: [
      'John J. Grainger, William D. Stevenson - Power System Analysis (McGraw-Hill)',
      'Hadi Saadat - Power System Analysis (McGraw-Hill 3rd Ed)',
    ],
  },

  // -------------------------------------------------------------
  // MECHANICAL ENGINEERING (MECH)
  // -------------------------------------------------------------
  {
    courseCode: 'ME201',
    courseName: 'Mechanics of Solids & Strength of Materials',
    courseDesc: 'Stress-strain relations, Mohrs circle, shear force and bending moment diagrams, beam deflection, torsion, and buckling.',
    branchCode: 'MECH',
    branchName: 'Mechanical Engineering',
    units: [
      { unit: 'Unit 1', title: 'Simple Stresses, Strains & Elastic Moduli', topics: 'Normal and shear stress, Hookes law, stress-strain curves for ductile and brittle materials, Poissons ratio, volumetric strain' },
      { unit: 'Unit 2', title: 'Compound Stresses & 2D Mohr Circle', topics: 'Stresses on inclined planes, principal stresses, principal planes, maximum shear stress, graphical construction of Mohrs circle' },
      { unit: 'Unit 3', title: 'Shear Force & Bending Moment in Beams', topics: 'Beam support classifications, point loads, uniformly distributed loads (UDL), uniformly varying loads (UVL), SFD and BMD construction' },
      { unit: 'Unit 4', title: 'Flexural Stresses, Shear Stresses & Deflection', topics: 'Pure bending theory (Euler-Bernoulli), section modulus, shear stress distribution across I and T sections, double integration method' },
      { unit: 'Unit 5', title: 'Torsion of Circular Shafts & Column Buckling', topics: 'Torsion formula for solid and hollow shafts, polar modulus, angle of twist, Eulers column buckling theory, Rankine-Gordon formula' },
    ],
    examQuestions: [
      '1. Draw the Shear Force Diagram (SFD) and Bending Moment Diagram (BMD) for an overhanging beam subjected to combined UDL and point loads.',
      '2. Given a 2D stress element with sigma_x = 80 MPa, sigma_y = -40 MPa, and tau_xy = 30 MPa, construct Mohrs circle and determine principal stresses.',
      '3. Derive the Euler column buckling load P_cr for a slender column with one end fixed and the other end pinned.',
    ],
    labExperiments: [
      'Lab 1: Tensile Strength and Ductility Determination of Mild Steel Specimen on Universal Testing Machine (UTM)',
      'Lab 2: Torsion Testing of Solid Steel Shaft to Measure Modulus of Rigidity (G)',
      'Lab 3: Deflection Testing of Simply Supported and Cantilever Beams to Verify Flexural Rigidity (EI)',
      'Lab 4: Brinell and Rockwell Hardness Characterization of Ferrous and Non-Ferrous Alloys',
    ],
    bookRefs: [
      'Ferdinand P. Beer, E. Russell Johnston - Mechanics of Materials (McGraw-Hill 7th Ed)',
      'James M. Gere, Barry J. Goodno - Mechanics of Materials (Cengage Learning 8th Ed)',
    ],
  },
  {
    courseCode: 'ME301',
    courseName: 'Applied Thermodynamics & Energy Conversion Cycles',
    courseDesc: 'First and second laws, entropy generation, exergy analysis, Rankine steam cycles, air standard cycles (Otto, Diesel, Brayton), and refrigeration.',
    branchCode: 'MECH',
    branchName: 'Mechanical Engineering',
    units: [
      { unit: 'Unit 1', title: 'First Law of Thermodynamics & Energy Analysis', topics: 'Thermodynamic systems, boundary work, heat interactions, First Law for closed systems, steady-flow energy equation (SFEE) for nozzles and turbines' },
      { unit: 'Unit 2', title: 'Second Law, Entropy & Exergy Destruction', topics: 'Kelvin-Planck and Clausius statements, Carnot cycle, Clausius inequality, entropy change for ideal gases and steam, availability and irreversibility' },
      { unit: 'Unit 3', title: 'Vapor Power Cycles (Rankine)', topics: 'Ideal Rankine cycle, superheat, reheat cycle, regenerative feed-water heating, thermal efficiency, boiler and condenser heat duties' },
      { unit: 'Unit 4', title: 'Gas Power Cycles (Otto, Diesel, Dual, Brayton)', topics: 'Air standard assumptions, Otto and Diesel cycles, mean effective pressure (MEP), Brayton gas turbine cycle, intercooling and regeneration' },
      { unit: 'Unit 5', title: 'Refrigeration & Psychrometric Principles', topics: 'Vapor Compression Refrigeration (VCR), Coefficient of Performance (COP), refrigerants, psychrometric chart, specific and relative humidity' },
    ],
    examQuestions: [
      '1. Derive the thermal efficiency equation for an ideal air-standard Diesel cycle in terms of compression ratio (r) and cut-off ratio (r_c).',
      '2. A steam power plant operates on an ideal reheat Rankine cycle between 10 MPa and 10 kPa. Calculate net work output and thermal efficiency.',
      '3. Explain exergy destruction and derive the Gouy-Stodola theorem relating irreversibility to entropy generation.',
    ],
    labExperiments: [
      'Lab 1: Valve Timing Diagram and Port Timing Diagram of Four-Stroke and Two-Stroke Internal Combustion Engines',
      'Lab 2: Performance Evaluation and Heat Balance Sheet of Multi-Cylinder Four-Stroke Diesel Engine',
      'Lab 3: Determination of Coefficient of Performance (COP) of Vapor Compression Refrigeration Test Rig',
      'Lab 4: Calorific Value Determination of Solid and Liquid Fuels using Bomb Calorimeter',
    ],
    bookRefs: [
      'Yunus A. Cengel, Michael A. Boles - Thermodynamics: An Engineering Approach (McGraw-Hill 8th Ed)',
      'P.K. Nag - Engineering Thermodynamics (McGraw-Hill 5th Ed)',
    ],
  },

  // -------------------------------------------------------------
  // CIVIL ENGINEERING (CIVIL)
  // -------------------------------------------------------------
  {
    courseCode: 'CE201',
    courseName: 'Surveying, Geomatics & Remote Sensing',
    courseDesc: 'Distance measurement, leveling, contouring, theodolite traversing, total stations, GPS positioning, and GIS spatial data.',
    branchCode: 'CIVIL',
    branchName: 'Civil Engineering',
    units: [
      { unit: 'Unit 1', title: 'Fundamental Surveying Principles & Chain Survey', topics: 'Principles of surveying, scales, error propagation, chain surveying, ranging, obstacles, corrections for temperature and sag' },
      { unit: 'Unit 2', title: 'Compass Surveying & Leveling Methods', topics: 'Prismatic compass, magnetic declination, local attraction, differential leveling, rise and fall method, height of instrument method, contouring' },
      { unit: 'Unit 3', title: 'Theodolite Traversing & Curve Setting', topics: 'Vernier theodolite, horizontal and vertical angles, latitude and departure, Gales traverse table, simple circular curves, transition curves' },
      { unit: 'Unit 4', title: 'Tacheometry & Modern Total Station', topics: 'Stadia tacheometry principle, tangential tacheometry, electronic distance measurement (EDM), Total Station component operations' },
      { unit: 'Unit 5', title: 'Global Positioning Systems & GIS Analysis', topics: 'GPS segments (space, control, user), satellite trilateration, pseudo-range errors, Geographic Information Systems (GIS), spatial layers' },
    ],
    examQuestions: [
      '1. Compute the reduced levels of points from a level book page using both the Height of Instrument (HI) and Rise-and-Fall methods.',
      '2. Balance a closed theodolite traverse using Bowditchs rule and compute closing error magnitude and bearing.',
      '3. Describe the method of setting out a simple circular curve by the two-theodolite method without linear chain measurements.',
    ],
    labExperiments: [
      'Lab 1: Chain Traversing and Plotting of an Irregular Field Boundary with Obstacle Clearance',
      'Lab 2: Differential and Profile Leveling with Longitudinal and Cross-Sectional Plotting',
      'Lab 3: Measurement of Horizontal Angles by Repetition and Reiteration Methods using Vernier Theodolite',
      'Lab 4: Topographical Feature Survey and Coordinate Mapping using Electronic Total Station',
    ],
    bookRefs: [
      'B.C. Punmia, Ashok K. Jain - Surveying Vol. I & II (Laxmi Publications)',
      'T.P. Kanetkar, S.V. Kulkarni - Surveying and Levelling (Pune Vidyarthi Griha Prakashan)',
    ],
  },
  {
    courseCode: 'CE301',
    courseName: 'Structural Analysis & Indeterminate Systems',
    courseDesc: 'Static and kinematic indeterminacy, slope-deflection, moment distribution, Castiglianos energy theorems, and influence lines.',
    branchCode: 'CIVIL',
    branchName: 'Civil Engineering',
    units: [
      { unit: 'Unit 1', title: 'Structural Indeterminacy & Energy Methods', topics: 'Static and kinematic indeterminacy of beams, frames, and trusses, strain energy, Castiglianos first and second theorems, Bettis theorem' },
      { unit: 'Unit 2', title: 'Slope-Deflection Method for Beams & Frames', topics: 'Slope-deflection equations, continuous beams with support settlements, non-sway and sway portal frame structural equilibrium' },
      { unit: 'Unit 3', title: 'Moment Distribution Method (Hardy Cross)', topics: 'Stiffness factors, carry-over factors, distribution factors, continuous beams with sinking supports, single-bay portal frames' },
      { unit: 'Unit 4', title: 'Influence Lines for Moving Loads', topics: 'Influence line diagrams (ILD) for reactions, shear force, and bending moments in determinate beams, Muller-Breslau principle' },
      { unit: 'Unit 5', title: 'Matrix Methods of Structural Analysis', topics: 'Flexibility matrix method (force method), Stiffness matrix method (displacement method), element coordinate transformations' },
    ],
    examQuestions: [
      '1. Analyze a continuous beam ABC having a settlement of 5 mm at support B using the Slope-Deflection Method and draw the final BMD.',
      '2. Apply the Moment Distribution Method to analyze a two-span continuous beam with fixed end supports and draw bending moment diagrams.',
      '3. State Muller-Breslaus Principle and draw the Influence Line Diagram (ILD) for the bending moment at mid-span of a continuous beam.',
    ],
    labExperiments: [
      'Lab 1: Verification of Castiglianos Second Theorem for Deflection of a Cantilever Truss',
      'Lab 2: Experimental Determination of Influence Lines for a Continuous Beam Model',
      'Lab 3: Structural Analysis and Deflection Verification of Redundant Portal Frames',
      'Lab 4: Computer-Aided Structural Modeling and Stress Analysis of High-Rise Frames using STAAD.Pro',
    ],
    bookRefs: [
      'C.S. Reddy - Basic Structural Analysis (McGraw-Hill 3rd Ed)',
      'R.C. Hibbeler - Structural Analysis (Pearson 9th Ed)',
    ],
  },
];
